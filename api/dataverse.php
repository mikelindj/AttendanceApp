<?php
/**
 * Dataverse CRUD API Endpoint
 * Performs Create, Read, Update, Delete operations on Dataverse
 * 
 * Required Configuration:
 * - Azure AD App Registration with Dataverse API permissions
 * - Client ID, Client Secret, Tenant ID
 * - Dataverse environment URL
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Azure AD Configuration
$CLIENT_ID = getenv('AZURE_CLIENT_ID');
$CLIENT_SECRET = getenv('AZURE_CLIENT_SECRET');
$TENANT_ID = getenv('AZURE_TENANT_ID');

// Dataverse Configuration
$DATAVERSE_URL = getenv('DATAVERSE_URL') ?: 'https://your-org.crm.dynamics.com';

// Table/Entity name in Dataverse
$ENTITY_NAME = 'your_custom_table'; // Change this to your Dataverse table logical name

// Validate configuration
if (empty($CLIENT_ID) || empty($CLIENT_SECRET) || empty($TENANT_ID)) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Azure AD configuration missing. Please set AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, and AZURE_TENANT_ID environment variables.'
    ]);
    exit;
}

/**
 * Get Azure AD access token using client credentials flow
 */
function getAccessToken($tenantId, $clientId, $clientSecret) {
    $tokenUrl = "https://login.microsoftonline.com/{$tenantId}/oauth2/v2.0/token";
    
    $data = [
        'client_id' => $clientId,
        'client_secret' => $clientSecret,
        'scope' => 'https://your-org.crm.dynamics.com/.default',
        'grant_type' => 'client_credentials'
    ];
    
    $ch = curl_init($tokenUrl);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/x-www-form-urlencoded'
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode !== 200) {
        throw new Exception("Failed to get access token: HTTP {$httpCode}");
    }
    
    $tokenData = json_decode($response, true);
    if (!isset($tokenData['access_token'])) {
        throw new Exception("Access token not found in response");
    }
    
    return $tokenData['access_token'];
}

/**
 * Make API request to Dataverse
 */
function makeDataverseRequest($method, $url, $accessToken, $data = null) {
    $ch = curl_init($url);
    
    $headers = [
        'Authorization: Bearer ' . $accessToken,
        'Content-Type: application/json',
        'OData-MaxVersion: 4.0',
        'OData-Version: 4.0',
        'Accept: application/json'
    ];
    
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    
    switch ($method) {
        case 'GET':
            // GET request - no additional options needed
            break;
        case 'POST':
            curl_setopt($ch, CURLOPT_POST, true);
            if ($data) {
                curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
            }
            break;
        case 'PUT':
        case 'PATCH':
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
            if ($data) {
                curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
            }
            break;
        case 'DELETE':
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
            break;
    }
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    if ($error) {
        throw new Exception("cURL error: {$error}");
    }
    
    return [
        'status' => $httpCode,
        'body' => $response
    ];
}

try {
    // Get access token
    $accessToken = getAccessToken($TENANT_ID, $CLIENT_ID, $CLIENT_SECRET);
    
    $method = $_SERVER['REQUEST_METHOD'];
    $requestBody = json_decode(file_get_contents('php://input'), true);
    
    switch ($method) {
        case 'GET':
            // READ - Get all records
            $url = "{$DATAVERSE_URL}/api/data/v9.2/{$ENTITY_NAME}";
            $result = makeDataverseRequest('GET', $url, $accessToken);
            
            if ($result['status'] === 200) {
                $data = json_decode($result['body'], true);
                echo json_encode([
                    'items' => $data['value'] ?? []
                ]);
            } else {
                http_response_code($result['status']);
                echo json_encode(['error' => 'Failed to fetch items', 'details' => $result['body']]);
            }
            break;
            
        case 'POST':
            // CREATE - Create new record
            if (!$requestBody || !isset($requestBody['name'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Name is required']);
                exit;
            }
            
            $url = "{$DATAVERSE_URL}/api/data/v9.2/{$ENTITY_NAME}";
            $data = [
                'your_name_field' => $requestBody['name'], // Change to your field name
                'your_description_field' => $requestBody['description'] ?? null, // Change to your field name
            ];
            
            $result = makeDataverseRequest('POST', $url, $accessToken, $data);
            
            if ($result['status'] === 201 || $result['status'] === 204) {
                // Fetch the created record
                $location = $result['headers']['Location'] ?? null;
                if ($location) {
                    $getResult = makeDataverseRequest('GET', $location, $accessToken);
                    $createdItem = json_decode($getResult['body'], true);
                    echo json_encode($createdItem);
                } else {
                    echo json_encode(['id' => 'new', 'name' => $requestBody['name']]);
                }
            } else {
                http_response_code($result['status']);
                echo json_encode(['error' => 'Failed to create item', 'details' => $result['body']]);
            }
            break;
            
        case 'PUT':
            // UPDATE - Update existing record
            if (!$requestBody || !isset($requestBody['id'])) {
                http_response_code(400);
                echo json_encode(['error' => 'ID is required']);
                exit;
            }
            
            $id = $requestBody['id'];
            $url = "{$DATAVERSE_URL}/api/data/v9.2/{$ENTITY_NAME}({$id})";
            $data = [];
            
            if (isset($requestBody['name'])) {
                $data['your_name_field'] = $requestBody['name']; // Change to your field name
            }
            if (isset($requestBody['description'])) {
                $data['your_description_field'] = $requestBody['description']; // Change to your field name
            }
            
            $result = makeDataverseRequest('PATCH', $url, $accessToken, $data);
            
            if ($result['status'] === 204) {
                // Fetch the updated record
                $getResult = makeDataverseRequest('GET', $url, $accessToken);
                $updatedItem = json_decode($getResult['body'], true);
                echo json_encode($updatedItem);
            } else {
                http_response_code($result['status']);
                echo json_encode(['error' => 'Failed to update item', 'details' => $result['body']]);
            }
            break;
            
        case 'DELETE':
            // DELETE - Delete record
            if (!$requestBody || !isset($requestBody['id'])) {
                http_response_code(400);
                echo json_encode(['error' => 'ID is required']);
                exit;
            }
            
            $id = $requestBody['id'];
            $url = "{$DATAVERSE_URL}/api/data/v9.2/{$ENTITY_NAME}({$id})";
            
            $result = makeDataverseRequest('DELETE', $url, $accessToken);
            
            if ($result['status'] === 204) {
                echo json_encode(['success' => true, 'id' => $id]);
            } else {
                http_response_code($result['status']);
                echo json_encode(['error' => 'Failed to delete item', 'details' => $result['body']]);
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            break;
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => $e->getMessage()
    ]);
}

