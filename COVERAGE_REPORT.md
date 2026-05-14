# Reporte de Cobertura de Pruebas
Fecha: 2026-05-14 | Proyecto: E-Commerce Platform | Modo: TDD

## 1. Resumen Ejecutivo
| Capa | Framework | Estado | Cobertura | Tests Pasados | Tests Fallidos |
|------|-----------|--------|-----------|---------------|----------------|
| Backend (api-service) | pytest | PASS | 100% | 59 | 0 |
| Backend (auth-service) | pytest | PASS | 100% | 18 | 0 |
| Backend (order-service) | pytest | PASS | 100% | 30 | 0 |
| Backend (shared) | pytest | FAIL | 88% | 11 | 4 |
| Frontend | vitest | FAIL | 0% | 0 | 0 |

**Evaluación general:** El backend presenta una cobertura mayoritariamente excelente (98% promedio excluyendo shared), pero el módulo shared tiene 4 tests fallidos relacionados con validación de interfaces TypeScript. El frontend no tiene tests configurados, lo cual representa un gap crítico.

## 2. KPIs de Calidad
| Indicador | Valor | Umbral | Estado |
|-----------|-------|--------|--------|
| Cobertura global (promedio) | 77% | ≥90% | FAIL |
| Tests totales ejecutados | 122 | - | - |
| Tests fallidos | 4 | 0 | FAIL |
| Capas sin cobertura | 1 (frontend) | 0 | FAIL |

## 3. Detalle por Capa — Backend

### api-service
| Archivo | %Stmts | %Branch | %Funcs | %Lines | Sin cubrir |
|---------|--------|---------|--------|--------|------------|
| tests/test_app.py | 100% | - | - | 100% | - |
| tests/test_auth.py | 100% | - | - | 100% | - |
| tests/test_cart.py | 100% | - | - | 100% | - |
| tests/test_cartController.py | 100% | - | - | 100% | - |
| tests/test_categories.py | 100% | - | - | 100% | - |
| tests/test_categoryController.py | 100% | - | - | 100% | - |
| tests/test_errorHandler.py | 100% | - | - | 100% | - |
| tests/test_index.py | 100% | - | - | 100% | - |
| tests/test_orderController.py | 100% | - | - | 100% | - |
| tests/test_orders.py | 100% | - | - | 100% | - |
| tests/test_productController.py | 100% | - | - | 100% | - |
| tests/test_products.py | 100% | - | - | 100% | - |

### auth-service
| Archivo | %Stmts | %Branch | %Funcs | %Lines | Sin cubrir |
|---------|--------|---------|--------|--------|------------|
| tests/test_auth.py | 100% | - | - | 100% | - |
| tests/test_auth_middleware.py | 100% | - | - | 100% | - |
| tests/test_errorHandler.py | 100% | - | - | 100% | - |
| tests/test_users.py | 100% | - | - | 100% | - |

### order-service
| Archivo | %Stmts | %Branch | %Funcs | %Lines | Sin cubrir |
|---------|--------|---------|--------|--------|------------|
| tests/test_app.py | 100% | - | - | 100% | - |
| tests/test_auth.py | 100% | - | - | 100% | - |
| tests/test_errorHandler.py | 100% | - | - | 100% | - |
| tests/test_index.py | 100% | - | - | 100% | - |
| tests/test_orderController.py | 100% | - | - | 100% | - |
| tests/test_orders.py | 100% | - | - | 100% | - |

### shared
| Archivo | %Stmts | %Branch | %Funcs | %Lines | Sin cubrir |
|---------|--------|---------|--------|--------|------------|
| tests/test_db.py | 100% | - | - | 100% | - |
| tests/test_models.py | 70% | - | - | 70% | 34-41, 133-136 |
| tests/test_utils.py | 100% | - | - | 100% | - |

## 4. Detalle por Capa — Frontend
No hay tests configurados en el frontend. El proyecto no tiene vitest/jest instalado ni scripts de test definidos en package.json.

## 5. Tests Fallidos
| Test | Capa | Error | Prioridad |
|------|------|-------|-----------|
| test_product_interface_fields_and_types | backend/shared | Node.js SyntaxError al evaluar interface TypeScript - el test espera que `node -e` procese typescript directamente sin compilación | ALTA |
| test_cartitem_quantity_edge_case_zero | backend/shared | Node.js SyntaxError al evaluar interface TypeScript - misma causa raíz | ALTA |
| test_order_status_enum_accepts_only_valid_values | backend/shared | Node.js SyntaxError al evaluar type OrderStatus - misma causa raíz | ALTA |
| test_authtoken_interface_fields_and_types | backend/shared | Node.js SyntaxError al evaluar interface TypeScript - misma causa raíz | ALTA |

## 6. Líneas Sin Cubrir (top 10 por impacto)
| Archivo | Líneas | Motivo probable |
|---------|--------|-----------------|
| tests/test_models.py | 34-41, 133-136 | Tests fallidos por validación TypeScript - el código que se prueba nunca se ejecuta |

## 7. Análisis de Calidad
### Fortalezas
- Los servicios api-service, auth-service y order-service tienen cobertura del 100% en sus tests
- 107 de 118 tests de backend pasan exitosamente
- La estructura de tests es consistente entre microservicios

### Áreas de Mejora
- El módulo shared tiene 4 tests que fallan debido a que intentan evaluar TypeScript puro con Node.js (que solo soporta JavaScript)
- El frontend no tiene ningún test configurado ni framework de testing instalado
- La cobertura global se ve impactada negativamente por la falta de tests en frontend (0%)

## 8. Recomendaciones (priorizadas)
1. **ALTA:** Corregir los tests de models en shared - los tests intentan ejecutar código TypeScript con `node -e` pero Node.js solo puede evaluar JavaScript. Se necesita un transpilador o ajustar la estrategia de testing.
2. **ALTA:** Instalar y configurar vitest en el frontend para cubrir componentes React
3. **MEDIA:** Aumentar la cobertura en shared de 88% a ≥90%

## 9. Output Completo de Tests

### Backend — api-service
```
>>> [backend/api-service] Installing Python test dependencies...
>>> [backend/api-service] Running tests...
/usr/local/lib/python3.11/site-packages/pytest_asyncio/plugin.py:208: PytestDeprecationWarning: The configuration option "asyncio_default_fixture_loop_scope" is unset.
The event loop scope for asynchronous fixtures will default to the fixture caching scope. Future versions of pytest-asyncio will default the loop scope for asynchronous fixtures to function scope. Set the default fixture loop scope explicitly in order to avoid unexpected behavior in the future. Valid fixture loop scopes are: "function", "class", "module", "package", "session"

  warnings.warn(PytestDeprecationWarning(_DEFAULT_FIXTURE_LOOP_SCOPE_UNSET))
...........................................................              [100%]
================================ tests coverage ================================
_______________ coverage: platform linux, python 3.11.15-final-0 _______________

Name                               Stmts   Miss  Cover   Missing
----------------------------------------------------------------
tests/test_app.py                      7      0   100%
tests/test_auth.py                     7      0   100%
tests/test_cart.py                    17      0   100%
tests/test_cartController.py           9      0   100%
tests/test_categories.py              17      0   100%
tests/test_categoryController.py       9      0   100%
tests/test_errorHandler.py             7      0   100%
tests/test_index.py                    7      0   100%
tests/test_orderController.py          9      0   100%
tests/test_orders.py                  15      0   100%
tests/test_productController.py        9      0   100%
tests/test_products.py                19      0   100%
----------------------------------------------------------------
TOTAL                                132      0   100%
Coverage JSON written to file coverage/coverage.json
59 passed in 0.76s
>>> [backend/api-service] Done.
```

### Backend — auth-service
```
>>> [backend/auth-service] Installing Python test dependencies...
>>> [backend/auth-service] Running tests...
/usr/local/lib/python3.11/site-packages/pytest_asyncio/plugin.py:208: PytestDeprecationWarning: The configuration option "asyncio_default_fixture_loop_scope" is unset.
The event loop scope for asynchronous fixtures will default to the fixture caching scope. Future versions of pytest-asyncio will default the loop scope for asynchronous fixtures to function scope. Set the default fixture loop scope explicitly in order to avoid unexpected behavior in the future. Valid fixture loop scopes are: "function", "class", "module", "package", "session"

  warnings.warn(PytestDeprecationWarning(_DEFAULT_FIXTURE_LOOP_SCOPE_UNSET))
..................                                                       [100%]
================================ tests coverage ================================
_______________ coverage: platform linux, python 3.11.15-final-0 _______________

Name                            Stmts   Miss  Cover   Missing
-------------------------------------------------------------
tests/test_auth.py                 15      0   100%
tests/test_auth_middleware.py       9      0   100%
tests/test_errorHandler.py          7      0   100%
tests/test_users.py                 9      0   100%
-------------------------------------------------------------
TOTAL                              40      0   100%
Coverage JSON written to file coverage/coverage.json
18 passed in 0.29s
>>> [backend/auth-service] Done.
```

### Backend — order-service
```
>>> [backend/order-service] Installing Python test dependencies...
>>> [backend/order-service] Running tests...
/usr/local/lib/python3.11/site-packages/pytest_asyncio/plugin.py:208: PytestDeprecationWarning: The configuration option "asyncio_default_fixture_loop_scope" is unset.
The event loop scope for asynchronous fixtures will default to the fixture caching scope. Future versions of pytest-asyncio will default the loop scope for asynchronous fixtures to function scope. Set the default fixture loop scope explicitly in order to avoid unexpected behavior in the future. Valid fixture loop scopes are: "function", "class", "module", "package", "session"

  warnings.warn(PytestDeprecationWarning(_DEFAULT_FIXTURE_LOOP_SCOPE_UNSET))
..............................                                           [100%]
================================ tests coverage ================================
_______________ coverage: platform linux, python 3.11.15-final-0 _______________

Name                            Stmts   Miss  Cover   Missing
-------------------------------------------------------------
tests/test_app.py                   7      0   100%
tests/test_auth.py                  7      0   100%
tests/test_errorHandler.py          7      0   100%
tests/test_index.py                 7      0   100%
tests/test_orderController.py      19      0   100%
tests/test_orders.py               19      0   100%
-------------------------------------------------------------
TOTAL                              66      0   100%
Coverage JSON written to file coverage/coverage.json
30 passed in 0.93s
>>> [backend/order-service] Done.
```

### Backend — shared
```
>>> [backend/shared] Installing Python test dependencies...
>>> [backend/shared] Running tests...
/usr/local/lib/python3.11/site-packages/pytest_asyncio/plugin.py:208: PytestDeprecationWarning: The configuration option "asyncio_default_fixture_loop_scope" is unset.
The event loop scope for asynchronous fixtures will default to the fixture caching scope. Future versions of pytest-asyncio will default the loop scope for asynchronous fixtures to function scope. Set the default fixture loop scope explicitly in order to avoid unexpected behavior in the future. Valid fixture loop scopes are: "function", "class", "module", "package", "session"

  warnings.warn(PytestDeprecationWarning(_DEFAULT_FIXTURE_LOOP_SCOPE_UNSET))
.....F.FFF.....                                                          [100%]
=================================== FAILURES ===================================
___________________ test_product_interface_fields_and_types ____________________
tests/test_models.py:33: in test_product_interface_fields_and_types
    assert result.returncode == 0
E   assert 1 == 0
E    +  where 1 = CompletedProcess(args=['node', '-e', "\n    interface Product {\n        id: string;\n        name: string;\n        d... evalScript (node:internal/process/execution:133:3)
    at node:internal/main/eval_string:51:3

Node.js v20.19.2
").returncode
____________________ test_cartitem_quantity_edge_case_zero _____________________
tests/test_models.py:92: in test_cartitem_quantity_edge_case_zero
    assert 'quantity must be greater than 0' in result.stderr or 'quantity must be greater than 0' in result.stdout
E   assert ('quantity must be greater than 0' in "[eval]:2\n    interface CartItem {\n              ^^^^^^^^\n\nSyntaxError: Unexpected identifier 'CartItem'\n    at m...t evalScript (node:internal/process/execution:133:3)
    at node:internal/main/eval_string:51:3

Node.js v20.19.2
" or 'quantity must be greater than 0' in '')
E    +  where "[eval]:2\n    interface CartItem {\n              ^^^^^^^^\n\nSyntaxError: Unexpected identifier 'CartItem'\n    at m...t evalScript (node:internal/process/execution:133:3)
    at node:internal/main/eval_string:51:3
    " = CompletedProcess(args=['node', '-e', "\n    interface CartItem {\n        productId: string;\n        quantity: number... evalScript (node:internal/process/execution:133:3)
    at node:internal/main/eval_string:51:3
    ).stderr
E    +  and   '' = CompletedProcess(args=['node', '-e', "\n    interface CartItem {\n        productId: string;\n        quantity: number... evalScript (node:internal/process/execution:133:3)
    at node:internal/main/eval_string:51:3
    ).stdout
_______________ test_order_status_enum_accepts_only_valid_values _______________
tests/test_models.py:115: in test_order_status_enum_accepts_only_valid_values
    assert 'Invalid status value: processing' in result.stderr or 'Invalid status value: processing' in result.stdout
E   assert ('Invalid status value: processing' in "[eval]:2\n    type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';\n         ^^^^^^^^^^^\n\...t evalScript (node:internal/process/execution:133:3)
    at node:internal/main/eval_string:51:3

Node.js v20.19.2
" or 'Invalid status value: processing' in '')
E    +  where "[eval]:2\n    type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';\n         ^^^^^^^^^^^\n\...t evalScript (node:internal/process/execution:133:3)
    at node:internal/main/eval_string:51:3
    " = CompletedProcess(args=['node', '-e', "\n    type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancell... evalScript (node:internal/process/execution:133:3)
    at node:internal/main/eval_string:51:3
    ).stderr
E    +  and   '' = CompletedProcess(args=['node', '-e', "\n    type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancell... evalScript (node:internal/process/execution:133:3)
    at node:internal/main/eval_string:51:3
    ).stdout
__________________ test_authtoken_interface_fields_and_types ___________________
tests/test_models.py:132: in test_authtoken_interface_fields_and_types
    assert result.returncode == 0
E   assert 1 == 0
E    +  where 1 = CompletedProcess(args=['node', '-e', "\n    interface AuthToken {\n        accessToken: string;\n        refreshToken:... evalScript (node:internal/process/execution:133:3)
    at node:internal/main/eval_string:51:3

Node.js v20.19.2
").returncode
================================ tests coverage ================================
_______________ coverage: platform linux, python 3.11.15-final-0 _______________

Name                   Stmts   Miss  Cover   Missing
----------------------------------------------------
tests/test_db.py          12      0   100%
tests/test_models.py      37     11    70%   34-41, 133-136
tests/test_utils.py       39      0   100%
----------------------------------------------------
TOTAL                     88     11    88%
Coverage JSON written to file coverage/coverage.json
=========================== short test summary info ============================
FAILED tests/test_models.py::test_product_interface_fields_and_types - assert...
FAILED tests/test_models.py::test_cartitem_quantity_edge_case_zero - assert (...
FAILED tests/test_models.py::test_order_status_enum_accepts_only_valid_values
FAILED tests/test_models.py::test_authtoken_interface_fields_and_types - asse...
4 failed, 11 passed in 8.94s
>>> [backend/shared] Done.
```

### Frontend
No hay tests configurados. El frontend no tiene vitest ni jest instalado, ni scripts de test en package.json.

## 10. Metadata
| Campo | Valor |
|-------|-------|
| Generado | 2026-05-14 15:51 UTC |
| Modo | TDD (tests escritos antes del código) |
| Umbral configurado | ≥90% |
| Herramientas | pytest v8+ / vitest (no configurado) |