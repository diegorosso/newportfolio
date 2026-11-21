<?php
/**
 * Envío del formulario de contacto. Recibe JSON { name, email, message, website } y
 * manda el mensaje por mail a TO desde el propio hosting (Hostinger corre PHP).
 *
 * Protecciones: solo POST desde el mismo sitio, campo trampa ("website") que los
 * humanos no ven, un envío cada 30 s por IP, validación de largo y de mail, y se
 * limpian los saltos de línea de lo que va a los encabezados (inyección de cabeceras).
 */

const TO = 'diegorosso1988@gmail.com';
const MAX_MESSAGE = 1000;
const COOLDOWN_SECONDS = 30;

header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-store');

/** Largo en caracteres; usa mbstring si está y, si no, cuenta caracteres UTF-8 */
function len(string $text): int
{
    return function_exists('mb_strlen') ? mb_strlen($text, 'UTF-8') : preg_match_all('/./us', $text);
}

function respond(int $status, bool $ok, string $error = ''): void
{
    http_response_code($status);
    echo json_encode($ok ? ['ok' => true] : ['ok' => false, 'error' => $error]);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(405, false, 'method');
}

// Solo desde este mismo sitio
// (sin "www." ni puerto, para comparar solo el dominio)
$host = preg_replace('/^www\.|:\d+$/i', '', $_SERVER['HTTP_HOST'] ?? '');
$origin = parse_url($_SERVER['HTTP_ORIGIN'] ?? '', PHP_URL_HOST);
if ($origin && strcasecmp(preg_replace('/^www\./i', '', $origin), $host) !== 0) {
    respond(403, false, 'origin');
}

$data = json_decode(file_get_contents('php://input'), true);
if (!is_array($data)) {
    respond(400, false, 'invalid');
}

// Campo trampa: si viene lleno es un bot. Se responde "ok" para no darle pistas
if (!empty($data['website'])) {
    respond(200, true);
}

$clean = fn($value) => trim(preg_replace('/[\r\n]+/', ' ', (string) $value));
$name = $clean($data['name'] ?? '');
$email = $clean($data['email'] ?? '');
$message = trim(str_replace("\r", '', (string) ($data['message'] ?? '')));

if ($name === '' || len($name) > 100) {
    respond(422, false, 'name');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || len($email) > 160) {
    respond(422, false, 'email');
}
if ($message === '' || len($message) > MAX_MESSAGE) {
    respond(422, false, 'message');
}

// Un envío cada 30 s por IP
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$stamp = sys_get_temp_dir() . '/contact_' . md5($ip);
if (is_file($stamp) && time() - (int) filemtime($stamp) < COOLDOWN_SECONDS) {
    respond(429, false, 'rate');
}

$subject = '=?UTF-8?B?' . base64_encode("Contacto desde el portfolio — $name") . '?=';
$body = "Nombre: $name\nEmail: $email\n\n$message\n";

// El remitente tiene que ser del propio dominio, si no el hosting lo rechaza o cae en spam
$fromHost = preg_match('/^[a-z0-9.-]+$/i', $host) ? $host : 'localhost';
$headers = [
    'From: Portfolio <no-reply@' . $fromHost . '>',
    'Reply-To: ' . $name . ' <' . $email . '>',
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'X-Mailer: PHP/' . PHP_VERSION,
];

if (!mail(TO, $subject, $body, implode("\r\n", $headers))) {
    respond(500, false, 'send');
}

@touch($stamp);
respond(200, true);
