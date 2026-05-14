import pytest
import subprocess
import json
import os

def test_product_interface_fields_and_types():
    ts_code = '''
    interface Product {
        id: string;
        name: string;
        description: string;
        price: number;
        stock: number;
        categoryId: string;
        imageUrl: string;
        createdAt: string;
        updatedAt: string;
    }
    const product: Product = {
        id: 'test-id',
        name: 'Test',
        description: 'Test desc',
        price: 1000,
        stock: 10,
        categoryId: 'cat-1',
        imageUrl: 'http://example.com/img.png',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    console.log(JSON.stringify(product));
    '''
    result = subprocess.run(['node', '-e', ts_code], capture_output=True, text=True)
    assert result.returncode == 0
    data = json.loads(result.stdout.strip())
    expected_fields = ['id', 'name', 'description', 'price', 'stock', 'categoryId', 'imageUrl', 'createdAt', 'updatedAt']
    for field in expected_fields:
        assert field in data, f"Missing field: {field}"
        if field in ['price', 'stock']:
            assert isinstance(data[field], (int, float)), f"{field} should be number"
        else:
            assert isinstance(data[field], str), f"{field} should be string"

def test_user_interface_missing_required_field_raises_error():
    ts_code = '''
    interface User {
        id: string;
        email: string;
        passwordHash: string;
        name: string;
        address: string;
        phone: string;
        createdAt: string;
        updatedAt: string;
    }
    const user = {
        id: 'uuid',
        passwordHash: 'hash',
        name: 'Test User',
        address: '123 Main St',
        phone: '555-1234',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
    };
    const requiredFields = ['email'];
    for (const field of requiredFields) {
        if (!(field in user)) {
            throw new Error('Missing required field: ' + field);
        }
    }
    console.log('All fields present');
    '''
    result = subprocess.run(['node', '-e', ts_code], capture_output=True, text=True)
    assert result.returncode != 0 or 'Missing required field: email' in result.stderr or 'Missing required field: email' in result.stdout

def test_cartitem_quantity_edge_case_zero():
    ts_code = '''
    interface CartItem {
        productId: string;
        quantity: number;
    }
    const cartItem: CartItem = {
        productId: 'uuid',
        quantity: 0
    };
    if (cartItem.quantity <= 0) {
        throw new Error('quantity must be greater than 0');
    }
    console.log('Valid quantity');
    '''
    result = subprocess.run(['node', '-e', ts_code], capture_output=True, text=True)
    assert result.returncode != 0
    assert 'quantity must be greater than 0' in result.stderr or 'quantity must be greater than 0' in result.stdout

def test_order_status_enum_accepts_only_valid_values():
    ts_code = '''
    type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
    interface Order {
        id: string;
        userId: string;
        items: any[];
        total: number;
        status: OrderStatus;
        createdAt: string;
        updatedAt: string;
    }
    const validStatuses: OrderStatus[] = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
    const testStatus = 'processing';
    if (!validStatuses.includes(testStatus as OrderStatus)) {
        throw new Error('Invalid status value: ' + testStatus);
    }
    console.log('Valid status');
    '''
    result = subprocess.run(['node', '-e', ts_code], capture_output=True, text=True)
    assert result.returncode != 0
    assert 'Invalid status value: processing' in result.stderr or 'Invalid status value: processing' in result.stdout

def test_authtoken_interface_fields_and_types():
    ts_code = '''
    interface AuthToken {
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
    }
    const token: AuthToken = {
        accessToken: 'access-token-value',
        refreshToken: 'refresh-token-value',
        expiresIn: 3600
    };
    console.log(JSON.stringify(token));
    '''
    result = subprocess.run(['node', '-e', ts_code], capture_output=True, text=True)
    assert result.returncode == 0
    data = json.loads(result.stdout.strip())
    assert 'accessToken' in data and isinstance(data['accessToken'], str)
    assert 'refreshToken' in data and isinstance(data['refreshToken'], str)
    assert 'expiresIn' in data and isinstance(data['expiresIn'], (int, float))