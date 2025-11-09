import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function prepareTypes() {
  try {
    const typesPath = join(__dirname, '..', 'dist', 'index.d.ts')
    let typesContent = await readFile(typesPath, 'utf-8')
    
    // Fix TypeScript declaration issues
    typesContent = typesContent.replace(
      /import\('\.\/[^']*'\)\.DefineComponent/g,
      'import("vue").DefineComponent'
    )
    
    await writeFile(typesPath, typesContent)
    console.log('✅ TypeScript definitions prepared successfully')
  } catch (error) {
    console.error('❌ Error preparing TypeScript definitions:', error)
    process.exit(1)
  }
}

await prepareTypes()