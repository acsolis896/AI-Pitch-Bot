import { Configuration, OpenAIApi } from 'openai'

const setupTextarea = document.getElementById('setup-textarea')
const setupInputContainer = document.getElementById('setup-input-container')
const movieBossText = document.getElementById('movie-boss-text')

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
})

const openai = new OpenAIApi(configuration)

document.getElementById("send-btn").addEventListener("click", () => {
  if (setupTextarea.value) {
    const userInput = setupTextarea.value

    setupInputContainer.innerHTML = `<img src="images/loading.svg" class="loading" id="loading">`
    movieBossText.innerText = `Ok, just wait a second while my digital brain digests that...`
    
    fetchBotReply(userInput)
  }
})

async function fetchBotReply(song) {
  const response = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: `Generate a short message to enthusiastically say a song choice sounds interesting and that you need some minutes to think about it.
    ###
    song: Tolerate It - Taylor Swift
    message: I'll need to think about that. But your choice is amazing! I love the "evermore" album!
    ###
    song: The Less I Know The Better
    message: I'll spend a few moments considering that, but I love that song! Tame Impala is a great band!
    ###
    song: Mi Gente - J Balvin
    message: Wow that is an awesome choice! J Balvin is such cool artist!
    ###
    song: ${song}
    message: 
    `,
    max_tokens: 60 
  })
  movieBossText.innerText = response.data.choices[0].text.trim()
} 


async function fetchSynopsis(song) {
  const response = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: `Generate an engaging, professional and marketable movie synopsis based on the lyrics of the song provided. The synopsis should include actors names in brackets after each character. Choose actors that would be ideal for this role. 
    ###
    song: Mi Gente - J Balvin
    synopsis: Carmen (Zoe Saldana), a young woman feeling disconnected from her culture and lacking in passion, discovers the power of Latin dance and community after stumbling upon a video of people dancing to "Mi Gente." She finds a local dance studio and, despite feeling nervous, signs up for a class. As she learns to let go and dance freely, she connects with a group of strangers who share her love of movement and music. The dance instructor (Oscar Isaac) is charismatic and supportive, while the other dancers include a shy but talented young woman (Yara Shahidi), a flamboyant and energetic man (Lin-Manuel Miranda), and an older woman with a fiery spirit (Rita Moreno). "Mi Gente" becomes Carmen's anthem, and she learns to embrace her roots and find joy in her life once again.  
    ###
    song: ${song}
    synopsis: 
    `,
    max_tokens: 700
  })
  const synopsis = response.data.choices[0].text.trim()
  document.getElementById('output-text').innerText = synopsis
  fetchTitle(synopsis)
  fetchStars(synopsis)
}

async function fetchTitle(synopsis) {
  const response = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: `Generate a catchy movie title for this synopsis: ${synopsis}`,
    max_tokens: 25,
    temperature: 0.7
  })
  const title = response.data.choices[0].text.trim()
  document.getElementById('output-title').innerText = title
  fetchImagePrompt(title, synopsis)
}

async function fetchStars(synopsis){
  const response = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: `Extract the names in brackets from the synopsis.
    ###
    synopsis: The Top Gun Naval Fighter Weapons School is where the best of the best train to refine their elite flying skills. When hotshot fighter pilot Maverick (Tom Cruise) is sent to the school, his reckless attitude and cocky demeanor put him at odds with the other pilots, especially the cool and collected Iceman (Val Kilmer). But Maverick isn't only competing to be the top fighter pilot, he's also fighting for the attention of his beautiful flight instructor, Charlotte Blackwood (Kelly McGillis). Maverick gradually earns the respect of his instructors and peers - and also the love of Charlotte, but struggles to balance his personal and professional life. As the pilots prepare for a mission against a foreign enemy, Maverick must confront his own demons and overcome the tragedies rooted deep in his past to become the best fighter pilot and return from the mission triumphant.
    names: Tom Cruise, Val Kilmer, Kelly McGillis
    ###
    synopsis: ${synopsis}
    names:   
    `,
    max_tokens: 30
  })
  document.getElementById('output-stars').innerText = response.data.choices[0].text.trim()
}

async function fetchImagePrompt(title, synopsis){
  const response = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: `Give a short description of an image which could be used to advertise a movie based on a title and synopsis. The description should be rich in visual detail but contain no names.
    ###
    title: Love's Time Warp
    synopsis: When scientist and time traveller Wendy (Emma Watson) is sent back to the 1920s to assassinate a future dictator, she never expected to fall in love with them. As Wendy infiltrates the dictator's inner circle, she soon finds herself torn between her mission and her growing feelings for the leader (Brie Larson). With the help of a mysterious stranger from the future (Josh Brolin), Wendy must decide whether to carry out her mission or follow her heart. But the choices she makes in the 1920s will have far-reaching consequences that reverberate through the ages.
    image description: A silhouetted figure stands in the shadows of a 1920s speakeasy, her face turned away from the camera. In the background, two people are dancing in the dim light, one wearing a flapper-style dress and the other wearing a dapper suit. A semi-transparent image of war is super-imposed over the scene.
    ###
    title: zero Earth
    synopsis: When bodyguard Kob (Daniel Radcliffe) is recruited by the United Nations to save planet Earth from the sinister Simm (John Malkovich), an alien lord with a plan to take over the world, he reluctantly accepts the challenge. With the help of his loyal sidekick, a brave and resourceful hamster named Gizmo (Gaten Matarazzo), Kob embarks on a perilous mission to destroy Simm. Along the way, he discovers a newfound courage and strength as he battles Simm's merciless forces. With the fate of the world in his hands, Kob must find a way to defeat the alien lord and save the planet.
    image description: A tired and bloodied bodyguard and hamster standing atop a tall skyscraper, looking out over a vibrant cityscape, with a rainbow in the sky above them.
    ###
    title: ${title}
    synopsis: ${synopsis}
    image description: 
    `,
    temperature: 0.8,
    max_tokens: 100
  })
  fetchImageUrl(response.data.choices[0].text.trim())
}

async function fetchImageUrl(imagePrompt){
  const response = await openai.createImage({
    prompt: `${imagePrompt}. There should be no text in this image.`,
    n: 1,
    size: '256x256',
    response_format: 'b64_json' 
  })
  document.getElementById('output-img-container').innerHTML = `<img src="data:image/png;base64,${response.data.data[0].b64_json}">`
  setupInputContainer.innerHTML = `<button id="view-pitch-btn" class="view-pitch-btn">View Pitch</button>`
  document.getElementById('view-pitch-btn').addEventListener('click', ()=>{
    document.getElementById('setup-container').style.display = 'none'
    document.getElementById('output-container').style.display = 'flex'
    movieBossText.innerText = `This idea is so good I'm jealous! It's gonna make you rich for sure! Remember, I want 10% 💰`
  })
}