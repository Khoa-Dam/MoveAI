import FetchABITool from '../Fetch_ABI'

describe('FetchABITool', () => {
  jest.setTimeout(30000) // Increase timeout to 30 seconds

  test('fetch move modules tool', async () => {
    const tool = new FetchABITool()
    const result = await tool._call({
      moduleAddress: 'bab16723778052052bd4a09f4b1317f4d41620d51c7f9eb249f566570424ecc6',
      moduleName: 'marketplace'
    })

    // Parse the result
    const parsedResult = JSON.parse(result)
    expect(typeof parsedResult).toBe('object')

    // Check for required properties
    expect(parsedResult).toHaveProperty('address')
    expect(parsedResult).toHaveProperty('name')
    expect(parsedResult).toHaveProperty('exposed_functions')
    expect(parsedResult).toHaveProperty('structs')

    console.log('test tool call abi module from address and name module', parsedResult)
  })
})
