# Create target directories
New-Item -ItemType Directory -Path src/core/database, src/core/guards, src/core/decorators, src/core/strategies, src/modules/auth/dto, src/modules/aportes/dto, src/modules/categorias-documento/dto, src/modules/conceptos/dto, src/modules/documentos/dto, src/modules/reportes, src/modules/upload/dto -Force

# Move root app files
Move-Item -Path src/app/app.module.ts, src/app/app.controller.ts, src/app/app.service.ts -Destination src/ -Force
Remove-Item -Path src/app -Recurse -Force

# Move prisma
Move-Item -Path src/prisma/prisma.module.ts, src/prisma/prisma.service.ts -Destination src/core/database/ -Force
Remove-Item -Path src/prisma -Recurse -Force

# Move common decorators & guards
Move-Item -Path src/common/decorators/current-user.decorator.ts, src/common/decorators/roles.decorator.ts -Destination src/core/decorators/ -Force
Move-Item -Path src/common/guards/roles.guard.ts -Destination src/core/guards/ -Force
Remove-Item -Path src/common -Recurse -Force

# Move auth core security & module files
Move-Item -Path src/auth/jwt-auth.guard.ts -Destination src/core/guards/ -Force
Move-Item -Path src/auth/jwt.strategy.ts -Destination src/core/strategies/ -Force
Move-Item -Path src/auth/auth.controller.ts, src/auth/auth.module.ts, src/auth/auth.service.ts -Destination src/modules/auth/ -Force
Move-Item -Path src/auth/dto/* -Destination src/modules/auth/dto/ -Force
Remove-Item -Path src/auth -Recurse -Force

# Move modules
Move-Item -Path src/aportes/aportes.controller.ts, src/aportes/aportes.module.ts, src/aportes/aportes.service.ts -Destination src/modules/aportes/ -Force
Move-Item -Path src/aportes/dto/* -Destination src/modules/aportes/dto/ -Force
Remove-Item -Path src/aportes -Recurse -Force

Move-Item -Path src/categorias-documento/categorias-documento.controller.ts, src/categorias-documento/categorias-documento.module.ts, src/categorias-documento/categorias-documento.service.ts -Destination src/modules/categorias-documento/ -Force
Move-Item -Path src/categorias-documento/dto/* -Destination src/modules/categorias-documento/dto/ -Force
Remove-Item -Path src/categorias-documento -Recurse -Force

Move-Item -Path src/conceptos/conceptos.controller.ts, src/conceptos/conceptos.module.ts, src/conceptos/conceptos.service.ts -Destination src/modules/conceptos/ -Force
Move-Item -Path src/conceptos/dto/* -Destination src/modules/conceptos/dto/ -Force
Remove-Item -Path src/conceptos -Recurse -Force

Move-Item -Path src/documentos/documentos.controller.ts, src/documentos/documentos.module.ts, src/documentos/documentos.service.ts -Destination src/modules/documentos/ -Force
Move-Item -Path src/documentos/dto/* -Destination src/modules/documentos/dto/ -Force
Remove-Item -Path src/documentos -Recurse -Force

Move-Item -Path src/reportes/reportes.controller.ts, src/reportes/reportes.module.ts, src/reportes/reportes.service.ts -Destination src/modules/reportes/ -Force
Remove-Item -Path src/reportes -Recurse -Force

Move-Item -Path src/upload/upload.controller.ts, src/upload/upload.module.ts, src/upload/upload.service.ts -Destination src/modules/upload/ -Force
Move-Item -Path src/upload/dto/* -Destination src/modules/upload/dto/ -Force
Remove-Item -Path src/upload -Recurse -Force
