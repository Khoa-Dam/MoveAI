import CallFunctionTool from '../CallFunction'

test('call entry function tool', async () => {
  // Create tool instance with aptos client and account
  const tool = new CallFunctionTool()
  const result = await tool._call({
    moduleAddress: '0x05452fa342fdeb4d6dca674d335cdfb174fc289e85fd217b10d40b94a6804e60',
    moduleName: 'message',
    functionName: 'set_message',
    args: ['hello Aptos move Agent kit']
  })

  // Parse and verify the result
  const parsedResult = JSON.parse(result)
  expect(typeof parsedResult).toBe('object')
  expect(parsedResult).toHaveProperty('status')
  expect(parsedResult).toHaveProperty('hash')
  expect(parsedResult).toHaveProperty('message')
  expect(parsedResult.status).toBe('success')

  console.log('Test call entry function result:', parsedResult)
})
