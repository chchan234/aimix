import postgres from 'postgres';
import 'dotenv/config';

const sql = postgres(process.env.DATABASE_URL, {
  ssl: 'require',
  max: 1,
  connect_timeout: 10
});

async function runMigration() {
  try {
    console.log('Running admin tables migration...');

    // Add role column to users table
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'user'`;
    console.log('✓ Added role column to users table');

    // Set kakao_4548065516 as admin
    const result = await sql`UPDATE users SET role = 'admin' WHERE provider_id = '4548065516' AND provider = 'kakao' RETURNING email`;
    if (result.length > 0) {
      console.log(`✓ Set ${result[0].email} as admin`);
    } else {
      console.log('⚠ No user found with provider_id 4548065516');
    }

    // Create admin_logs table
    await sql`
      CREATE TABLE IF NOT EXISTS admin_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
        action VARCHAR(100) NOT NULL,
        target_type VARCHAR(50),
        target_id UUID,
        details JSONB,
        ip_address VARCHAR(45),
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;
    console.log('✓ Created admin_logs table');

    // Create indexes for admin_logs
    await sql`CREATE INDEX IF NOT EXISTS idx_admin_logs_admin ON admin_logs(admin_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_admin_logs_action ON admin_logs(action)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_admin_logs_created ON admin_logs(created_at)`;
    console.log('✓ Created admin_logs indexes');

    // Create service_logs table
    await sql`
      CREATE TABLE IF NOT EXISTS service_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        service_type VARCHAR(100) NOT NULL,
        credit_used INTEGER NOT NULL,
        input_summary TEXT,
        processing_time INTEGER,
        success BOOLEAN NOT NULL DEFAULT true,
        error_message TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;
    console.log('✓ Created service_logs table');

    // Create indexes for service_logs
    await sql`CREATE INDEX IF NOT EXISTS idx_service_logs_user ON service_logs(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_service_logs_service ON service_logs(service_type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_service_logs_created ON service_logs(created_at)`;
    console.log('✓ Created service_logs indexes');

    // Create announcements table
    await sql`
      CREATE TABLE IF NOT EXISTS announcements (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
        title VARCHAR(200) NOT NULL,
        content TEXT NOT NULL,
        type VARCHAR(20) NOT NULL DEFAULT 'info',
        is_active BOOLEAN NOT NULL DEFAULT true,
        is_pinned BOOLEAN NOT NULL DEFAULT false,
        start_date TIMESTAMP,
        end_date TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;
    console.log('✓ Created announcements table');

    // Create indexes for announcements
    await sql`CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(is_active)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_announcements_created ON announcements(created_at)`;
    console.log('✓ Created announcements indexes');

    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

runMigration();
