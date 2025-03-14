// import FetchABITool from '../Fetch_ABI'

// test('fetch move modules tool', async () => {
//   const tool = new FetchABITool()
//   const result = await tool._call({
//     moduleAddress: '0x05452fa342fdeb4d6dca674d335cdfb174fc289e85fd217b10d40b94a6804e60',
//     moduleName: 'message'
//   })

//   // Parse the result
//   const parsedResult = JSON.parse(result)
//   expect(typeof parsedResult).toBe('object')

//   // Check for required properties
//   expect(parsedResult).toHaveProperty('address')
//   expect(parsedResult).toHaveProperty('name')
//   expect(parsedResult).toHaveProperty('exposed_functions')
//   expect(parsedResult).toHaveProperty('structs')

//   console.log('test tool call abi module from address and name module', parsedResult)
// })
