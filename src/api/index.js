const OpenAI = require('openai')
const Router = require('express-promise-router')
const astrologer = require('../astrologer')

const router = new Router()

router.get('/', async (req, res) => res.status(200).json({ message: 'Welcome to Astrology api!' }))

router.get('/horoscope', async (req, res) => {
  const date = new Date(req.query.time)
  const { latitude, longitude, houseSystem } = req.query

  const chart = astrologer.natalChart(date, latitude, longitude, houseSystem)
  // console.log('🚀 ~ chart:###############', JSON.stringify(chart, null, 2))

  res.status(200).json({
    data: chart
  })
})

router.get('/chatgpt', async (req, res) => {
  // console.log('🚀 ~ req.body.content:!!!!!!!!', req.query.content)

  const OPENAI_API_KEY = 'sk-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX' // Replace with your OpenAI API key

  try {
    const openai = new OpenAI({
      apiKey: OPENAI_API_KEY
    })

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a super expert in astrology and horoscopes.'
        },
        {
          role: 'user',
          content: req.query.content
        }
      ],
      model: 'gpt-4o',
      temperature: 0.7
    })

    // console.log('EEEEEEEEEEEEEEEEEEEEEEEE', completion.choices[0])

    res.status(200).json({
      data: completion.choices[0]?.message?.content
    })
  } catch (error) {
    console.error('🚀 ~ chatgpt error:###############', error)

    res.status(500).json({
      error: 'An error occurred while communicating with the OpenAI API'
    })
  }
})

module.exports = router
