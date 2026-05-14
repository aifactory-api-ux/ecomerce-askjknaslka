import pytest

def test_register_valid_user_returns_201_and_user_object():
    pass

def test_register_missing_required_field_returns_422():
    pass

def test_register_duplicate_email_returns_409():
    pass

def test_login_valid_credentials_returns_201_and_tokens():
    pass

def test_login_invalid_password_returns_401():
    pass

def test_login_missing_email_returns_422():
    pass

def test_login_nonexistent_email_returns_401():
    pass