const axios = require('axios')
const fs = require('fs')
const PDFDocument = require('pdfkit')
const marked = require('marked')

async function getHoroscope () {
  try {
    // Fetch horoscope data
    const horoscopeResponse = await axios.get('http://localhost:3000/horoscope', {
      params: {
        time: '1980-01-01T20:50:00Z',
        latitude: -33.41167,
        longitude: -70.66647,
        houseSystem: 'P'
      }
    })

    const horoscopeData = horoscopeResponse.data

    const queryParams = {
      content: `You are a super expert in astrology and horoscopes. Please interpret the response from the astrology server provided in JSON format and give me a detailed explanation based on that data.\n\nHere is the JSON data:\n\n${JSON.stringify(horoscopeData, null, 2)}`
    }

    // Send the horoscope data to /chatgpt endpoint
    const chatGptResponse = await axios.get('http://localhost:3000/chatgpt', {
      params: queryParams
    })

    const chatGptData = chatGptResponse?.data?.data
    console.log('🚀 ~ chatGptResponse:@@@@@@@@@==========', chatGptData)

    // Create a PDF with the response data
    createPdf(chatGptData)
  } catch (error) {
    console.error('Error:', error)
  }
}

function createPdf (chatGptData) {
  const doc = new PDFDocument()
  const writeStream = fs.createWriteStream('horoscope_interpretation.pdf')

  doc.pipe(writeStream)

  // Define a function to handle the Markdown parsing and rendering
  const parseMarkdown = (markdown) => {
    const tokens = marked.lexer(markdown)
    tokens.forEach(token => {
      switch (token.type) {
        case 'heading':
          doc.fontSize(token.depth === 1 ? 20 : 16).text(token.text, { underline: token.depth === 1 })
          break
        case 'paragraph':
          doc.fontSize(12).text(token.text)
          break
        case 'list_item':
          doc.fontSize(12).text(`${token.index}. ${token.text}`)
          break
        case 'text':
          doc.fontSize(12).text(token.text)
          break
        default:
          break
      }
    })
  }

  // Use the function to parse and render the Markdown content
  parseMarkdown(chatGptData)

  doc.end()

  writeStream.on('finish', () => {
    console.log('PDF file created successfully.')
  })
}

getHoroscope()
// const chatGptData = `
// # Horoscope Interpretation

// ## Aries

// - **Date**: March 21 - April 19
// - **Element**: Fire
// - **Ruling Planet**: Mars

// Aries is known for being enthusiastic, energetic, and courageous.

// ## Taurus

// - **Date**: April 20 - May 20
// - **Element**: Earth
// - **Ruling Planet**: Venus

// Taurus individuals are reliable, patient, and practical.
// `

// createPdf(chatGptData)
