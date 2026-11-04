<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Метод не поддерживается.'], JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * @return array{
 *   radist_api_url?: string,
 *   radist_api_key?: string,
 *   radist_chat_id?: string,
 *   telegram_bot_token?: string,
 *   telegram_chat_id?: string,
 *   log_file?: string,
 *   rate_dir?: string
 * }
 */
function load_config(): array
{
    $config = [];

    $envMap = [
        'radist_api_url' => ['MEDIALIVE_RADIST_API_URL', 'RADIST_API_URL'],
        'radist_api_key' => ['MEDIALIVE_RADIST_API_KEY', 'RADIST_API_KEY'],
        'radist_chat_id' => ['MEDIALIVE_RADIST_CHAT_ID', 'RADIST_CHAT_ID', 'RADIST_CONNECTION_ID'],
        'telegram_bot_token' => ['MEDIALIVE_TELEGRAM_BOT_TOKEN', 'TELEGRAM_BOT_TOKEN'],
        'telegram_chat_id' => ['MEDIALIVE_TELEGRAM_CHAT_ID', 'TELEGRAM_CHAT_ID'],
    ];
    foreach ($envMap as $key => $names) {
        foreach ($names as $name) {
            $val = getenv($name);
            if ($val !== false && $val !== '') {
                $config[$key] = trim($val);
                break;
            }
        }
    }

    $paths = ['/etc/medialive/lead.conf', '/etc/medialive/lead.ini'];
    foreach ($paths as $path) {
        if (!is_readable($path)) {
            continue;
        }
        $parsed = parse_ini_file($path, false, INI_SCANNER_RAW);
        if (is_array($parsed)) {
            $iniKeys = [
                'radist_api_url',
                'radist_api_key',
                'radist_chat_id',
                'telegram_bot_token',
                'telegram_chat_id',
                'log_file',
                'rate_dir',
            ];
            foreach ($iniKeys as $iniKey) {
                if (!empty($parsed[$iniKey])) {
                    $config[$iniKey] = trim((string) $parsed[$iniKey]);
                }
            }
        }
        break;
    }

    $config['log_file'] = $config['log_file'] ?? '/var/log/medialive/leads.log';
    $config['rate_dir'] = $config['rate_dir'] ?? '/var/lib/medialive/rate-limit';

    return $config;
}

function radist_is_configured(array $config): bool
{
    return ($config['radist_api_url'] ?? '') !== ''
        && ($config['radist_api_key'] ?? '') !== ''
        && ($config['radist_chat_id'] ?? '') !== '';
}

function telegram_is_configured(array $config): bool
{
    return ($config['telegram_bot_token'] ?? '') !== ''
        && ($config['telegram_chat_id'] ?? '') !== '';
}

/**
 * HTTP POST (JSON или form) для интеграций доставки заявок.
 *
 * @return array{ok: bool, status: int, body: string}
 */
function http_post(string $url, array $headers, string $body): array
{
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_POSTFIELDS => $body,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 12,
        ]);
        $responseBody = curl_exec($ch);
        $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        return [
            'ok' => $status >= 200 && $status < 300,
            'status' => $status,
            'body' => is_string($responseBody) ? $responseBody : '',
        ];
    }

    $headerLines = implode("\r\n", $headers);
    $ctx = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => $headerLines . "\r\n",
            'content' => $body,
            'timeout' => 12,
            'ignore_errors' => true,
        ],
    ]);
    $responseBody = @file_get_contents($url, false, $ctx);
    $status = 0;
    if (isset($http_response_header[0]) && preg_match('/\s(\d{3})\s/', (string) $http_response_header[0], $m)) {
        $status = (int) $m[1];
    }
    return [
        'ok' => $status >= 200 && $status < 300,
        'status' => $status,
        'body' => is_string($responseBody) ? $responseBody : '',
    ];
}

/**
 * Отправка заявки в Telegram-чат «Заявки LED» через Radist API (основной канал).
 *
 * @param string $apiUrl  Базовый URL API Radist (radist_api_url из конфига).
 * @param string $apiKey  Ключ API (radist_api_key).
 * @param string $chatId  ID подключения / чата в Radist (radist_chat_id).
 * @param string $text    Текст заявки (plain text).
 *
 * TODO: сверить с актуальной документацией Radist — метод, путь и схема JSON.
 * TODO: подставить реальный endpoint (ниже — заглушка: POST на $apiUrl с телом-черновиком).
 * TODO: проверить код ответа и поле success/id в JSON ответа Radist.
 */
function send_radist(string $apiUrl, string $apiKey, string $chatId, string $text): bool
{
    $url = rtrim($apiUrl, '/');

    // TODO: заменить путь и структуру тела на формат Radist для отправки сообщения в чат.
    $payload = json_encode([
        'connection_id' => $chatId,
        'chat_id' => $chatId,
        'message' => $text,
    ], JSON_UNESCAPED_UNICODE);

    if ($payload === false) {
        return false;
    }

    $headers = [
        'Content-Type: application/json',
        'Accept: application/json',
        // TODO: уточнить имя заголовка авторизации (Authorization, X-Api-Key и т.д.).
        'Authorization: Bearer ' . $apiKey,
    ];

    $response = http_post($url, $headers, $payload);
    if (!$response['ok']) {
        return false;
    }

    // TODO: распарсить ответ Radist и вернуть true только при успешной доставке.
    $json = json_decode($response['body'], true);
    if (is_array($json)) {
        if (array_key_exists('success', $json)) {
            return (bool) $json['success'];
        }
        if (array_key_exists('ok', $json)) {
            return (bool) $json['ok'];
        }
    }

    return $response['body'] !== '';
}

function client_ip(): string
{
    if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $parts = explode(',', (string) $_SERVER['HTTP_X_FORWARDED_FOR']);
        return trim($parts[0]);
    }
    return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
}

function normalize_phone(string $raw): ?string
{
    $digits = preg_replace('/\D+/', '', $raw) ?? '';
    if ($digits === '') {
        return null;
    }
    if (strlen($digits) === 11 && $digits[0] === '8') {
        $digits = '7' . substr($digits, 1);
    } elseif (strlen($digits) === 10) {
        $digits = '7' . $digits;
    }
    if (!preg_match('/^7\d{10}$/', $digits)) {
        return null;
    }
    return '+' . $digits;
}

function rate_limit(string $dir, string $ip): ?string
{
    if (!is_dir($dir) && !@mkdir($dir, 0750, true) && !is_dir($dir)) {
        return null;
    }
    $key = hash('sha256', $ip);
    $file = rtrim($dir, '/') . '/' . $key;
    $now = time();
    $window = 60;
    $last = is_file($file) ? (int) @file_get_contents($file) : 0;
    if ($last > 0 && ($now - $last) < $window) {
        return 'Слишком частые отправки. Подождите минуту и попробуйте снова.';
    }
    @file_put_contents($file, (string) $now, LOCK_EX);
    return null;
}

function append_log(string $path, array $record): void
{
    $dir = dirname($path);
    if (!is_dir($dir)) {
        @mkdir($dir, 0750, true);
    }
    $line = json_encode($record, JSON_UNESCAPED_UNICODE) . "\n";
    @file_put_contents($path, $line, FILE_APPEND | LOCK_EX);
}

/** Запасной канал: Telegram Bot API (если задан в конфиге). */
function send_telegram(string $token, string $chatId, string $text): bool
{
    $url = 'https://api.telegram.org/bot' . rawurlencode($token) . '/sendMessage';
    $payload = http_build_query([
        'chat_id' => $chatId,
        'text' => $text,
        'parse_mode' => 'HTML',
        'disable_web_page_preview' => '1',
    ]);

    $response = http_post($url, ['Content-Type: application/x-www-form-urlencoded'], $payload);
    if (!$response['ok']) {
        return false;
    }
    $json = json_decode($response['body'], true);
    return is_array($json) && !empty($json['ok']);
}

function build_lead_plain_text(
    string $name,
    string $phone,
    string $contact,
    string $eventType,
    string $servicesText,
    string $city,
    string $eventDate,
    string $scale,
    string $sourcePage
): string {
    $lines = [
        'Новая заявка с сайта Medialive',
        '',
        'Имя: ' . $name,
        'Телефон: ' . $phone,
        'Связь: ' . $contact,
        'Тип: ' . $eventType,
        'Услуги: ' . $servicesText,
        'Город: ' . $city,
        'Дата: ' . $eventDate,
    ];
    if ($scale !== '') {
        $lines[] = 'Масштаб: ' . $scale;
    }
    $lines[] = 'Страница: ' . ($sourcePage !== '' ? $sourcePage : '/');
    return implode("\n", $lines);
}

function build_lead_html_text(
    string $name,
    string $phone,
    string $contact,
    string $eventType,
    string $servicesText,
    string $city,
    string $eventDate,
    string $scale,
    string $sourcePage
): string {
    $lines = [
        '<b>Новая заявка с сайта Medialive</b>',
        '',
        'Имя: ' . htmlspecialchars($name, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'),
        'Телефон: ' . htmlspecialchars($phone, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'),
        'Связь: ' . htmlspecialchars($contact, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'),
        'Тип: ' . htmlspecialchars($eventType, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'),
        'Услуги: ' . htmlspecialchars($servicesText, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'),
        'Город: ' . htmlspecialchars($city, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'),
        'Дата: ' . htmlspecialchars($eventDate, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'),
    ];
    if ($scale !== '') {
        $lines[] = 'Масштаб: ' . htmlspecialchars($scale, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    }
    $lines[] = 'Страница: ' . htmlspecialchars($sourcePage !== '' ? $sourcePage : '/', ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    return implode("\n", $lines);
}

/**
 * Доставка заявки: сначала Radist, при неудаче — Telegram Bot API (если настроен).
 */
function deliver_lead(array $config, string $plainText, string $htmlText): bool
{
    if (radist_is_configured($config)) {
        $sent = send_radist(
            (string) $config['radist_api_url'],
            (string) $config['radist_api_key'],
            (string) $config['radist_chat_id'],
            $plainText
        );
        if ($sent) {
            return true;
        }
    }

    if (telegram_is_configured($config)) {
        return send_telegram(
            (string) $config['telegram_bot_token'],
            (string) $config['telegram_chat_id'],
            $htmlText
        );
    }

    return false;
}

$raw = file_get_contents('php://input') ?: '';
$data = json_decode($raw, true);
if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Некорректный запрос.'], JSON_UNESCAPED_UNICODE);
    exit;
}

if (!empty($data['company_website'])) {
    echo json_encode(['ok' => true], JSON_UNESCAPED_UNICODE);
    exit;
}

$ip = client_ip();
$config = load_config();

$rateError = rate_limit($config['rate_dir'], $ip);
if ($rateError !== null) {
    http_response_code(429);
    echo json_encode(['ok' => false, 'error' => $rateError], JSON_UNESCAPED_UNICODE);
    exit;
}

$phone = normalize_phone((string) ($data['phone'] ?? ''));
$name = trim((string) ($data['name'] ?? ''));
$city = trim((string) ($data['city'] ?? ''));
$eventDate = trim((string) ($data['event_date'] ?? ''));
$eventType = trim((string) ($data['event_type_label'] ?? $data['event_type'] ?? ''));
$contact = trim((string) ($data['contact_method_label'] ?? $data['contact_method'] ?? ''));
$scale = trim((string) ($data['scale'] ?? ''));
$services = $data['service_labels'] ?? $data['services'] ?? [];
if (!is_array($services)) {
    $services = [];
}
$servicesText = implode(', ', array_map('strval', $services));
$consent = !empty($data['consent']);

if ($name === '' || $phone === null || $city === '' || $eventDate === '' || $eventType === '' || $servicesText === '' || $contact === '' || !$consent) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => 'Заполните обязательные поля.'], JSON_UNESCAPED_UNICODE);
    exit;
}

$record = [
    'ts' => gmdate('c'),
    'ip' => $ip,
    'name' => $name,
    'phone' => $phone,
    'contact' => $contact,
    'event_type' => $eventType,
    'services' => $servicesText,
    'city' => $city,
    'event_date' => $eventDate,
    'scale' => $scale,
    'source_page' => (string) ($data['source_page'] ?? ''),
];

append_log($config['log_file'], $record);

if (!radist_is_configured($config) && !telegram_is_configured($config)) {
    http_response_code(503);
    echo json_encode([
        'ok' => false,
        'error' => 'Сервис заявок временно не настроен. Позвоните +7 (926) 335-39-35 или напишите в Telegram @medialiveled.',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$sourcePage = (string) ($data['source_page'] ?? '');
$plainText = build_lead_plain_text($name, $phone, $contact, $eventType, $servicesText, $city, $eventDate, $scale, $sourcePage);
$htmlText = build_lead_html_text($name, $phone, $contact, $eventType, $servicesText, $city, $eventDate, $scale, $sourcePage);

$sent = deliver_lead($config, $plainText, $htmlText);

if (!$sent) {
    http_response_code(502);
    echo json_encode(['ok' => false, 'error' => 'Не удалось отправить заявку. Попробуйте позже или свяжитесь с нами по телефону.'], JSON_UNESCAPED_UNICODE);
    exit;
}

echo json_encode(['ok' => true], JSON_UNESCAPED_UNICODE);
