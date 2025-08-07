import 'dotenv/config'
import fs from 'fs/promises'
import path from 'path'
import { translateMessages, TranslationOptions } from './translate'

/**
 * 递归提取所有键（使用点表示法）
 * @param obj 对象
 * @param prefix 前缀
 * @returns 键数组
 */
function extractAllKeys(obj: any, prefix = ''): string[] {
  let keys: string[] = []

  for (const key in obj) {
    const newKey = prefix ? `${prefix}.${key}` : key
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys = [...keys, ...extractAllKeys(obj[key], newKey)]
    } else {
      keys.push(newKey)
    }
  }

  return keys
}

/**
 * 顺序翻译所有键
 * @param options 翻译选项
 */
export async function sequentialTranslate(options: Omit<TranslationOptions, 'mode' | 'keys'> = {}): Promise<void> {
  try {
    // 读取英文消息文件
    const messagesDir = path.join(process.cwd(), 'messages')
    const englishMessagesPath = path.join(messagesDir, 'en.json')
    const englishMessagesText = await fs.readFile(englishMessagesPath, 'utf-8')
    const englishMessages = JSON.parse(englishMessagesText)

    // 提取所有键
    const allKeys = extractAllKeys(englishMessages)
    console.log(`找到 ${allKeys.length} 个键需要翻译`)

    // 设置批次大小
    const batchSize = 5 // 每次翻译5个键
    const batches = []

    // 将键分成批次
    for (let i = 0; i < allKeys.length; i += batchSize) {
      batches.push(allKeys.slice(i, i + batchSize))
    }

    console.log(`将分 ${batches.length} 批进行翻译`)

    // 顺序翻译每个批次
    let successCount = 0
    let failureCount = 0
    let skippedCount = 0

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i]
      console.log(`\n开始翻译批次 ${i + 1}/${batches.length}，包含 ${batch.length} 个键`)
      console.log(`键: ${batch.join(', ')}`)

      const translationOptions: TranslationOptions = {
        mode: 'keys',
        keys: batch,
        ...options
      }

      try {
        const results = await translateMessages(translationOptions)

        // 处理结果
        for (const result of results) {
          if (result.success) {
            if (result.translatedKeys && result.translatedKeys.length > 0) {
              console.log(`✅ ${result.locale}: ${result.message}`)
              successCount += result.translatedKeys.length
            } else if (result.message?.includes('没有需要翻译的内容')) {
              console.log(`ℹ️ ${result.locale}: ${result.message}`)
              skippedCount += batch.length
            }
          } else {
            console.log(`❌ ${result.locale}: ${result.error}`)
            failureCount += batch.length
          }
        }

        // 添加延迟以避免API限制
        if (i < batches.length - 1) {
          console.log('等待3秒后继续下一批...')
          await new Promise((resolve) => setTimeout(resolve, 3000))
        }
      } catch (error) {
        console.error(`批次 ${i + 1} 翻译失败:`, error)
        failureCount += batch.length
      }
    }

    console.log('\n翻译完成!')
    console.log('====================')
    console.log(`总计键: ${allKeys.length}`)
    console.log(`成功翻译: ${successCount}`)
    console.log(`跳过翻译: ${skippedCount}`)
    console.log(`失败翻译: ${failureCount}`)
  } catch (error) {
    console.error('顺序翻译过程失败:', error)
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  // 解析命令行参数
  const args = process.argv.slice(2)
  const targetLocales = args.length > 0 ? args : undefined

  console.log('开始顺序翻译过程...')
  if (targetLocales) {
    console.log(`目标语言: ${targetLocales.join(', ')}`)
  } else {
    console.log('将翻译所有支持的语言')
  }

  sequentialTranslate({ targetLocales })
    .then(() => console.log('顺序翻译脚本完成'))
    .catch((err) => {
      console.error('顺序翻译脚本失败:', err)
      process.exit(1)
    })
}