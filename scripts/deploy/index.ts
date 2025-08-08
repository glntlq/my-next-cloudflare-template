import 'dotenv/config'
import { execSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { NotFoundError } from 'cloudflare'

import { createDatabase, createKVNamespace, createPages, getDatabase, getKVNamespaceList, getPages } from './cloudflare'

const PROJECT_NAME = process.env.PROJECT_NAME || 'next-template'
const DATABASE_NAME = process.env.DATABASE_NAME || 'next-template-db'
const KV_NAMESPACE_NAME = process.env.KV_NAMESPACE_NAME || 'next-template-kv'
const KV_NAMESPACE_ID = process.env.KV_NAMESPACE_ID
const environments = [
  'AUTH_SECRET',
  'AUTH_GOOGLE_ID',
  'AUTH_GOOGLE_SECRET',
  'AUTH_RESEND_KEY',
  'NEXT_PUBLIC_BASE_URL',
  'NEXT_PUBLIC_ADMIN_ID'
]

/**
 * 验证必要的环境变量
 */
const validateEnvironment = () => {
  const missing = environments.filter((varName) => !process.env[varName])

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}

/**
 * 设置所有Wrangler配置文件
 */
const setupWranglerConfigs = () => {
  console.log('🔧 Setting up Wrangler configuration files...')

  const configContent = readFileSync(resolve('wrangler.jsonc'), 'utf-8')
  const json = JSON.parse(configContent)

  json.name = PROJECT_NAME

  if (json.d1_databases && json.d1_databases.length > 0) {
    json.d1_databases[0].database_name = DATABASE_NAME
  }

  writeFileSync(resolve('wrangler.jsonc'), JSON.stringify(json, null, 2))

  console.log(`✅ Configuration ${resolve('wrangler.jsonc')} setup successfully.`)
}

/**
 * 更新数据库ID到配置文件
 */
const updateDatabaseConfig = (dbId: string) => {
  console.log(`📝 Updating database ID (${dbId}) in configurations...`)

  const wranglerPath = resolve('wrangler.jsonc')
  if (existsSync(wranglerPath)) {
    try {
      const json = JSON.parse(readFileSync(wranglerPath, 'utf-8'))
      if (json.d1_databases && json.d1_databases.length > 0) {
        json.d1_databases[0].database_id = dbId
      }
      writeFileSync(wranglerPath, JSON.stringify(json, null, 2))
      console.log(`✅ Updated database ID in ${wranglerPath}`)
    } catch (error) {
      console.error(`❌ Failed to update ${wranglerPath}:`, error)
    }
  }
}

/**
 * 更新KV命名空间ID到配置文件
 */
const updateKVConfig = (namespaceId: string) => {
  console.log(`📝 Updating KV namespace ID (${namespaceId}) in configurations...`)

  const wranglerPath = resolve('wrangler.jsonc')
  if (existsSync(wranglerPath)) {
    try {
      const json = JSON.parse(readFileSync(wranglerPath, 'utf-8'))
      if (json.kv_namespaces && json.kv_namespaces.length > 0) {
        json.kv_namespaces[0].id = namespaceId
      }
      writeFileSync(wranglerPath, JSON.stringify(json, null, 2))
      console.log(`✅ Updated KV namespace ID in ${wranglerPath}`)
    } catch (error) {
      console.error(`❌ Failed to update ${wranglerPath}:`, error)
    }
  }
}

/**
 * 检查并创建数据库
 */
const checkAndCreateDatabase = async () => {
  console.log(`🔍 Checking if database "${DATABASE_NAME}" exists...`)

  try {
    const database = await getDatabase()

    if (!database || !database.uuid) {
      throw new Error('Database object is missing a valid UUID')
    }

    updateDatabaseConfig(database.uuid)
    console.log(`✅ Database "${DATABASE_NAME}" already exists (ID: ${database.uuid})`)
  } catch (error) {
    if (error instanceof NotFoundError) {
      console.log(`⚠️ Database not found, creating new database...`)
      try {
        const database = await createDatabase()

        if (!database || !database.uuid) {
          throw new Error('Database object is missing a valid UUID')
        }

        updateDatabaseConfig(database.uuid)
        console.log(`✅ Database "${DATABASE_NAME}" created successfully (ID: ${database.uuid})`)
      } catch (createError) {
        console.error(`❌ Failed to create database:`, createError)
        throw createError
      }
    } else {
      console.error(`❌ An error occurred while checking the database:`, error)
      throw error
    }
  }
}

/**
 * 迁移数据库
 */
const migrateDatabase = () => {
  console.log('📝 Migrating remote database...')
  try {
    execSync('pnpm run db:migrate-remote', { stdio: 'inherit' })
    console.log('✅ Database migration completed successfully')
  } catch (error) {
    console.error('❌ Database migration failed:', error)
    throw error
  }
}

/**
 * 检查并创建KV命名空间
 */
const checkAndCreateKVNamespace = async () => {
  console.log(`🔍 Checking if KV namespace "${KV_NAMESPACE_NAME}" exists...`)

  if (KV_NAMESPACE_ID) {
    updateKVConfig(KV_NAMESPACE_ID)
    console.log(`✅ User specified KV namespace (ID: ${KV_NAMESPACE_ID})`)
    return
  }

  try {
    let namespace

    const namespaceList = await getKVNamespaceList()
    namespace = namespaceList.find((ns) => ns.title === KV_NAMESPACE_NAME)

    if (namespace && namespace.id) {
      updateKVConfig(namespace.id)
      console.log(`✅ KV namespace "${KV_NAMESPACE_NAME}" found by name (ID: ${namespace.id})`)
    } else {
      console.log('⚠️ KV namespace not found by name, creating new KV namespace...')
      namespace = await createKVNamespace()
      updateKVConfig(namespace.id)
      console.log(`✅ KV namespace "${KV_NAMESPACE_NAME}" created successfully (ID: ${namespace.id})`)
    }
  } catch (error) {
    console.error(`❌ An error occurred while checking the KV namespace:`, error)
    throw error
  }
}

/**
 * 检查并创建Pages项目
 */
const checkAndCreatePages = async () => {
  console.log(`🔍 Checking if project "${PROJECT_NAME}" exists...`)

  try {
    await getPages()
    console.log('✅ Project already exists, proceeding with update...')
  } catch (error) {
    if (error instanceof NotFoundError) {
      console.log('⚠️ Project not found, creating new project...')
      await createPages()
    } else {
      console.error(`❌ An error occurred while checking the project:`, error)
      throw error
    }
  }
}

/**
 * 推送Pages密钥
 */
const pushPagesSecret = () => {
  console.log('🔐 Pushing environment secrets to Pages...')

  try {
    // 确保.env文件存在
    if (!existsSync(resolve('.env'))) {
      setupEnvFile()
    }

    // 创建一个临时文件，只包含运行时所需的环境变量
    const envContent = readFileSync(resolve('.env'), 'utf-8')
    const runtimeEnvFile = resolve('.env.runtime')

    // 从.env文件中提取运行时变量
    const runtimeEnvContent = envContent
      .split('\n')
      .filter((line) => {
        const trimmedLine = line.trim()
        // 跳过注释和空行
        if (!trimmedLine || trimmedLine.startsWith('#')) return false

        // 检查是否为运行时所需的环境变量
        for (const varName of environments) {
          if (line.startsWith(`${varName} =`) || line.startsWith(`${varName}=`)) {
            return true
          }
        }
        return false
      })
      .join('\n')

    // 写入临时文件
    writeFileSync(runtimeEnvFile, runtimeEnvContent)

    // 使用临时文件推送secrets
    execSync(`pnpm dlx wrangler pages secret bulk ${runtimeEnvFile}`, { stdio: 'inherit' })

    // 清理临时文件
    execSync(`rm ${runtimeEnvFile}`, { stdio: 'inherit' })

    console.log('✅ Secrets pushed successfully')
  } catch (error) {
    console.error('❌ Failed to push secrets:', error)
    throw error
  }
}

/**
 * 部署Pages应用
 */
const deployPages = () => {
  console.log('🚧 Deploying to Cloudflare Pages...')
  try {
    execSync('pnpm run deploy:pages', { stdio: 'inherit' })
    console.log('✅ Pages deployment completed successfully')
  } catch (error) {
    console.error('❌ Pages deployment failed:', error)
    throw error
  }
}

/**
 * 创建或更新环境变量文件
 */
const setupEnvFile = () => {
  console.log('📄 Setting up environment file...')
  const envFilePath = resolve('.env')
  const envExamplePath = resolve('.env.example')

  // 如果.env文件不存在，则从.env.example复制创建
  if (!existsSync(envFilePath) && existsSync(envExamplePath)) {
    console.log('⚠️ .env file does not exist, creating from example...')

    // 从示例文件复制
    let envContent = readFileSync(envExamplePath, 'utf-8')

    // 填充当前的环境变量
    const envVarMatches = envContent.match(/^([A-Z_]+)\s*=\s*".*?"/gm)
    if (envVarMatches) {
      for (const match of envVarMatches) {
        const varName = match.split('=')[0].trim()
        if (process.env[varName]) {
          const regex = new RegExp(`${varName}\\s*=\\s*".*?"`, 'g')
          envContent = envContent.replace(regex, `${varName} = "${process.env[varName]}"`)
        }
      }
    }

    writeFileSync(envFilePath, envContent)
    console.log('✅ .env file created from example')
  } else if (existsSync(envFilePath)) {
    console.log('✨ .env file already exists')
  } else {
    console.error('❌ .env.example file not found!')
    throw new Error('.env.example file not found')
  }
}

/**
 * 主函数
 */
const main = async () => {
  try {
    console.log('🚀 Starting deployment process...')

    validateEnvironment()
    setupEnvFile()
    setupWranglerConfigs()
    await checkAndCreateDatabase()
    migrateDatabase()
    // await checkAndCreateKVNamespace()
    await checkAndCreatePages()
    pushPagesSecret()
    deployPages()

    console.log('🎉 Deployment completed successfully')
  } catch (error) {
    console.error('❌ Deployment failed:', error)
    process.exit(1)
  }
}

main()