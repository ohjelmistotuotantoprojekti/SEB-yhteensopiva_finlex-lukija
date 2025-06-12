import { listStatuteVersionsByYear } from './src/db/load.js'
import fs from 'fs/promises'

async function testStatuteVersions(year: number) {
  try {
    const allUris = await listStatuteVersionsByYear(year, false) // Get unfiltered list
    const latestUris = await listStatuteVersionsByYear(year) // Get filtered list

    // Write to files with timestamp to avoid overwriting
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    
    await fs.writeFile(
      `statute-versions-all-${year}-${timestamp}.txt`, 
      allUris.join('\n')
    )
    
    await fs.writeFile(
      `statute-versions-latest-${year}-${timestamp}.txt`,
      latestUris.join('\n')
    )

    console.log(`Found ${allUris.length} total versions`)
    console.log(`Filtered to ${latestUris.length} latest versions`)
    console.log('Results written to files')
  } catch (error) {
    console.error('Test failed:', error)
  }
}

testStatuteVersions(2023)