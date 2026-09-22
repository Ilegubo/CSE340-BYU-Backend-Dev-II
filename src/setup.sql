-- Create the organization table
CREATE TABLE organization (
    org_id SERIAL PRIMARY KEY,          -- unique identifier
    org_name VARCHAR(100) NOT NULL,     -- organization name
    org_address VARCHAR(255),           -- optional address
    org_email VARCHAR(100) UNIQUE,      -- optional email, must be unique
    created_at TIMESTAMP DEFAULT NOW()  -- auto timestamp when row is added
);

-- Insert sample data
INSERT INTO organization (org_name, org_address, org_email)
VALUES
    ('Tech Solutions Ltd', '123 Innovation Street, Accra', 'info@techsolutions.com'),
    ('Green Earth NGO', '45 Sustainability Ave, Kumasi', 'contact@greenearth.org'),
    ('EduFuture Academy', '78 Learning Road, Tamale', 'admin@edufuture.edu');

-- Verify the data
SELECT * FROM organization;
