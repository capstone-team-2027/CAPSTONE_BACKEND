const { HfInference } = require('@huggingface/inference');

const hfToken = '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'; // Extracted from .env
const hf = new HfInference(hfToken);

async function runTest() {
  try {
    console.log("Calling HF API...");
    const translation = await hf.translation({
      model: 'Helsinki-NLP/opus-mt-vi-en',
      inputs: 'gương'
    });
    console.log("Translation Result:", translation);
    console.log("Type of translation:", typeof translation);
    console.log("Is array?", Array.isArray(translation));
  } catch (err) {
    console.error("Error calling HF:", err.message);
  }
}

runTest();
