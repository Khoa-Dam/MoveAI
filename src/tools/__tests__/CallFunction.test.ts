import CallFunctionTool from '../CallFunction'

describe('CallFunctionTool', () => {
  jest.setTimeout(30000) // Increase timeout to 30 seconds

  test('call entry function tool', async () => {
    const tool = new CallFunctionTool()

    try {
      const result = await tool._call({
        moduleAddress: '0x05452fa342fdeb4d6dca674d335cdfb174fc289e85fd217b10d40b94a6804e60',
        moduleName: 'message',
        functionName: 'set_message',
        args: ['Lo ngủ đi']
      })

      const parsedResult = JSON.parse(result)

      // Check response structure
      expect(parsedResult).toHaveProperty('status')
      expect(parsedResult).toHaveProperty('hash')
      expect(parsedResult).toHaveProperty('message')

      // Verify success
      expect(parsedResult.status).toBe('success')
      expect(typeof parsedResult.hash).toBe('string')
      console.log('test tool call entry function', parsedResult)
    } catch (error) {
      console.error('Test error:', error)
      throw error
    }
  })
})

// import CallFunctionTool from '../CallFunction'

// describe('CallFunctionTool', () => {
//   jest.setTimeout(30000) // Increase timeout to 30 seconds

//   test('call entry function tool', async () => {
//     const tool = new CallFunctionTool()

//     try {
//       const result = await tool._call({
//         moduleAddress: 'bab16723778052052bd4a09f4b1317f4d41620d51c7f9eb249f566570424ecc6',
//         moduleName: 'marketplace',
//         functionName: 'list_with_fixed_price',
//         typeArguments: ['0x1::aptos_coin::AptosCoin'],
//         args: ['0xbab16723778052052bd4a09f4b1317f4d41620d51c7f9eb249f566570424ecc6', '500']
//       })

//       const parsedResult = JSON.parse(result)

//       // Check response structure
//       expect(parsedResult).toHaveProperty('status')
//       expect(parsedResult).toHaveProperty('hash')
//       expect(parsedResult).toHaveProperty('message')

//       // Verify success
//       expect(parsedResult.status).toBe('success')
//       expect(typeof parsedResult.hash).toBe('string')
//       console.log('test tool call entry function', parsedResult)
//     } catch (error) {
//       console.error('Test error:', error)
//       throw error
//     }
//   })
// })
