import { useState } from 'react';
import Head from 'next/head';
import LoadingDots from '../components/LoadingDots';

export default function Home() {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSpeakClick = async () => {
    try {
      setLoading(true);
      //@ts-ignore
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = async event => {
        const speechResult = event.results[0][0].transcript;
        console.log(speechResult)
        setQuestion(speechResult);
        generateBio(speechResult);
      };
      recognition.start();
    } catch (error) {
      console.log('Speech recognition error:', error);
    }
  };

  const generateBio = async (speechResult) => {
    setResponse("");
    setLoading(true);
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: speechResult,
      }),
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    const data = response.body;
    if (!data) {
      return;
    }
    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      setResponse((prev) => prev + chunkValue);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>ChatGPT</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="py-8 flex items-center justify-center">
        <div className="max-w-lg w-full bg-white shadow-md rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-4">ChatGPT</h1>
          {!loading && (
            <button
              className="bg-black rounded-xl text-white font-medium px-4 py-2 sm:mt-10 mt-8 hover:bg-black/80 w-full"
              onClick={handleSpeakClick}
            >
              Speak
            </button>
          )}
          {loading && (
            <button
              className="bg-black rounded-xl text-white font-medium px-4 py-2 sm:mt-10 mt-8 hover:bg-black/80 w-full"
              disabled
            >
              <LoadingDots color="white" style="large" />
            </button>
          )}
          <p className="text-gray-600 mb-4">{question}</p>
          {console.log(response)}
          <p className="text-gray-900 font-medium mb-4">{response}</p>
        </div>
      </main>
    </div>
  );
}
