-- Script SQL para PostgreSQL - Gestão TI Pro

-- 1. Tabela de Unidades Fabris
CREATE TABLE manufacturing_units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) NOT NULL,
    city VARCHAR(100),
    state CHAR(2),
    active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabela de Empresas (Fornecedores)
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    document VARCHAR(20), -- CNPJ
    email VARCHAR(100),
    phone VARCHAR(20),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabela de Tipos de Equipamento
CREATE TABLE equipment_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabela de Técnicos
CREATE TABLE technicians (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    company_id UUID REFERENCES companies(id),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabela de Categorias de Custo
CREATE TABLE cost_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tabela de Manutenções
CREATE TABLE maintenances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number VARCHAR(50) NOT NULL,
    vendor_ticket_number VARCHAR(50),
    date DATE NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'EXTERNAL' ou 'WARRANTY'
    status VARCHAR(30) NOT NULL,
    unit_id UUID REFERENCES manufacturing_units(id),
    company_id UUID REFERENCES companies(id),
    equipment_type_id UUID REFERENCES equipment_types(id),
    brand VARCHAR(100),
    model VARCHAR(100),
    serial_number VARCHAR(100),
    asset_tag VARCHAR(100),
    issue_summary TEXT,
    shipment_date DATE,
    return_date DATE,
    closure_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Tabela de Custos de Manutenção
CREATE TABLE maintenance_costs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    maintenance_id UUID REFERENCES maintenances(id) ON DELETE CASCADE,
    category_id UUID REFERENCES cost_categories(id),
    description TEXT,
    quantity INTEGER DEFAULT 1,
    unit_value DECIMAL(12, 2) NOT NULL,
    total_value DECIMAL(12, 2) GENERATED ALWAYS AS (quantity * unit_value) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Tabela de Visitas Técnicas
CREATE TABLE visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(30) NOT NULL,
    unit_id UUID REFERENCES manufacturing_units(id),
    technician_id UUID REFERENCES technicians(id),
    company_id UUID REFERENCES companies(id),
    equipment_type_id UUID REFERENCES equipment_types(id),
    brand VARCHAR(100),
    model VARCHAR(100),
    serial_number VARCHAR(100),
    asset_tag VARCHAR(100),
    issue_summary TEXT,
    maintenance_id UUID REFERENCES maintenances(id), -- Vínculo opcional
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Tabela de Logs de Visitas
CREATE TABLE visit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visit_id UUID REFERENCES visits(id) ON DELETE CASCADE,
    date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    message TEXT NOT NULL,
    user_name VARCHAR(100) NOT NULL
);

-- 10. Tabela de Usuários e Perfis
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    permissions JSONB, -- Armazena as permissões de módulo
    special_permissions JSONB,
    active BOOLEAN DEFAULT true
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Armazenar hash em produção
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de junção para usuários e múltiplos perfis
CREATE TABLE user_profiles (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, profile_id)
);

-- Índices para performance
CREATE INDEX idx_maint_status ON maintenances(status);
CREATE INDEX idx_visits_date ON visits(date);
CREATE INDEX idx_maint_unit ON maintenances(unit_id);