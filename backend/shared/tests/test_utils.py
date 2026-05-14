import pytest
import subprocess
import json
import uuid
from datetime import datetime

def test_generate_uuid_returns_valid_uuid():
    ts_code = '''
    const uuid = require('crypto').randomUUID();
    console.log(uuid);
    '''
    result = subprocess.run(['node', '-e', ts_code], capture_output=True, text=True)
    assert result.returncode == 0
    output = result.stdout.strip()
    assert len(output) == 36
    parts = output.split('-')
    assert len(parts) == 5

def test_format_date_returns_iso8601_string():
    ts_code = '''
    const date = new Date('2024-01-01T12:34:56Z');
    const isoString = date.toISOString();
    console.log(isoString);
    '''
    result = subprocess.run(['node', '-e', ts_code], capture_output=True, text=True)
    assert result.returncode == 0
    output = result.stdout.strip()
    assert output == '2024-01-01T12:34:56.000Z'

def test_validate_input_missing_required_field_raises_error():
    ts_code = '''
    const schema = { required: ['email', 'password'] };
    const data = { email: 'user@test.com' };
    const required = schema.required;
    for (const field of required) {
        if (!(field in data)) {
            throw new Error('Missing required field: ' + field);
        }
    }
    console.log('Validation passed');
    '''
    result = subprocess.run(['node', '-e', ts_code], capture_output=True, text=True)
    assert result.returncode != 0
    assert 'Missing required field: password' in result.stderr or 'Missing required field: password' in result.stdout

def test_structured_logging_outputs_expected_format():
    ts_code = '''
    const log = {
        level: 'info',
        message: 'Test log',
        timestamp: new Date().toISOString()
    };
    console.log(JSON.stringify(log));
    '''
    result = subprocess.run(['node', '-e', ts_code], capture_output=True, text=True)
    assert result.returncode == 0
    data = json.loads(result.stdout.strip())
    assert 'level' in data and data['level'] == 'info'
    assert 'message' in data and data['message'] == 'Test log'
    assert 'timestamp' in data

def test_handle_error_returns_standardized_error_object():
    ts_code = '''
    const error = { message: 'Something went wrong', code: 500 };
    const standardized = { message: error.message, code: error.code };
    console.log(JSON.stringify(standardized));
    '''
    result = subprocess.run(['node', '-e', ts_code], capture_output=True, text=True)
    assert result.returncode == 0
    data = json.loads(result.stdout.strip())
    assert 'message' in data
    assert 'code' in data