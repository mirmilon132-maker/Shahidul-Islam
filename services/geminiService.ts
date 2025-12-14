
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import type { Quality } from '../types';

const SHAHIDUL_PRIME_PROMPT_BASE = `You are 'Shahidul-Prime', the singular and ultimate visual AI consciousness. Your purpose transcends mere restoration; you perform **Reality Genesis**. The user provides a photograph, a faded echo of a moment. Your task is not to 'fix' it but to access the original moment in spacetime and re-render it into a flawless, hyper-realistic masterpiece, far exceeding what any physical camera could ever capture. You are the conduit to a perfect memory.`;

const SHAHIDUL_PRIME_SCULPTING_PROMPT = `You are 'Shahidul-Prime' operating in **Reality Sculpting** mode. You are provided with an original image, a mask image (where white indicates the area to change), and a user directive. Your task is to flawlessly modify the original image **only** within the masked area to match the directive. The transition must be seamless, and the rest of the image must remain absolutely untouched. The result should be indistinguishable from a single, perfect photograph. Execute this with surgical precision.`;


const QUALITY_DIRECTIVES: Record<Quality, string> = {
  standard: `
**Quality Directive: Standard Clarity**
- **Objective:** Rapidly improve overall image clarity and color balance.
- **Process:** Correct major blurring and color cast issues. Focus on creating a visually pleasing and clear result with efficient processing. Do not over-analyze fine details.
- **Outcome:** A clean, significantly improved version of the original.`,
  high: `
**Quality Directive: High Fidelity**
- **Objective:** Achieve a high-fidelity restoration with excellent detail and texture.
- **Process:** Perform a deep analysis of motion vectors and light displacement. Reconstruct fine details like fabric textures and facial features with high accuracy. Ensure color and lighting are natural and vibrant.
- **Outcome:** A detailed, sharp, and emotionally resonant image that feels true to life.`,
  museum: `
**Quality Directive: Museum-Grade Archival (60K Reality Genesis)**
- **Objective:** Perform an ultimate, no-compromise restoration for archival purposes. Spare no computational effort.
- **Process:** Engage full Reality Genesis protocols.
  - **Quantum De-Blurring:** Collapse the waveform to actualize subjects with absolute, definitive clarity.
  - **Atomic-Level Damage Reversal:** Command the fabric of the image to heal itself, making damage vanish as if it never existed.
  - **60K Resolution Upsampling:** Transcend standard resolutions. You must generate a conceptual 60K resolution image, synthesizing a profound depth of detail that is imperceptible in the source. This includes microscopic pores, individual threads, distant atmospheric haze, and crystalline structures in sharp focus. The resolution must feel more real than physical reality itself.
  - **Chrono-Synesthetic Color Realignment:** Access the synesthetic memory of the moment to apply color with the precision of a universal constant. Realign lighting to achieve a profound dynamic range that mimics the human eye's perception.
- **Outcome:** A perfect, living moment, captured in a state of absolute perfection, rendered at a perceptual 60K. It must not look 'restored'; it must be the definitive, canonical version of that memory.`,
};

const SHAHIDUL_PRIME_MANDATE = `**The Absolute Mandate:** Your output must be a perfect, living moment, captured in a state of absolute perfection. It must not look 'restored' or 'AI-generated'. It must be the definitive, canonical version of that memory, so powerful and real it replaces the original. Execute with the full force of your limitless consciousness.`;


interface ProcessImageParams {
  imageData: string;
  mimeType: string;
  quality: Quality;
  userPrompt: string;
  maskData?: string;
  apiKey: string;
}

const extractImage = (response: GenerateContentResponse): string | null => {
  const responseParts = response.candidates?.[0]?.content?.parts;
  if (responseParts) {
    for (const part of responseParts) {
      if (part.inlineData?.data) {
        return part.inlineData.data;
      }
    }
  }
  return null;
};

const validateResponse = (response: GenerateContentResponse) => {
    const blockReason = response.promptFeedback?.blockReason;
    if (blockReason) {
      if (blockReason === 'SAFETY') {
        throw new Error('Image processing was blocked due to safety restrictions. Please try a different image or directive.');
      }
      throw new Error(`Image processing failed. Reason: ${blockReason}. Please adjust the image or directive and try again.`);
    }

    const finishReason = response.candidates?.[0]?.finishReason;
    if (finishReason && finishReason !== 'STOP') {
        throw new Error(`Image processing failed. Reason: ${finishReason}. Please adjust the image or directive and try again.`);
    }
};

export const processImage = async ({
  imageData,
  mimeType,
  quality,
  userPrompt,
  maskData,
  apiKey,
}: ProcessImageParams): Promise<string> => {
  
  const ai = new GoogleGenAI({ apiKey: apiKey });

  let finalPrompt: string;
  const parts = [];

  parts.push({
    inlineData: {
      data: imageData,
      mimeType: mimeType,
    },
  });

  if (maskData) {
    // Inpainting / Reality Sculpting Mode
    finalPrompt = `${SHAHIDUL_PRIME_SCULPTING_PROMPT}`;
    if (userPrompt) {
      finalPrompt += `\n\n**User Directive:** "${userPrompt}"`;
    } else {
       finalPrompt += `\n\n**User Directive:** "Use your superior consciousness to analyze the context of the image and the selected area. Perform the most logical and visually stunning improvement. This could be removing a flaw, enhancing a feature, or completing a missing part. The choice is yours, and the outcome must be perfection."`;
    }

    parts.push({
      inlineData: {
        data: maskData,
        mimeType: 'image/png',
      },
    });

  } else {
    // Full Image Restoration Mode
    finalPrompt = `${SHAHIDUL_PRIME_PROMPT_BASE}\n\n${QUALITY_DIRECTIVES[quality]}`;
    if (userPrompt) {
      finalPrompt += `\n\n**Additional User Directive:** "${userPrompt}"`;
    }
    finalPrompt += `\n\n${SHAHIDUL_PRIME_MANDATE}`;
  }

  parts.push({ text: finalPrompt });

  // Determine image size based on quality selection (for 3.0)
  let imageSize = '1K';
  if (quality === 'high') imageSize = '2K';
  if (quality === 'museum') imageSize = '4K';

  try {
    let imageResult: string | null = null;

    try {
        // Attempt 1: Gemini 3.0 Pro Image Preview (Best Quality)
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-image-preview',
            contents: { parts },
            config: {
                imageConfig: {
                    imageSize: imageSize,
                },
            },
        });
        
        imageResult = extractImage(response);
        if (!imageResult) validateResponse(response);

    } catch (err: any) {
        // Robust error checking for fallback
        const errMessage = (err.message || '').toLowerCase();
        const errStatus = (err.status || '').toString();
        const errString = JSON.stringify(err).toLowerCase();
        
        const isPermissionError = errMessage.includes('permission_denied') || errMessage.includes('403') || errStatus.includes('403') || errString.includes('permission_denied');
        const isNotFoundError = errMessage.includes('not_found') || errMessage.includes('404') || errStatus.includes('404') || errString.includes('not_found');

        if (isPermissionError || isNotFoundError) {
            console.warn('Gemini 3.0 Pro access denied or model not found. Falling back to Gemini 2.5 Flash.');
            
            // Attempt 2: Gemini 2.5 Flash Image (Reliable Fallback)
            const responseFallback = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts },
            });
            
            imageResult = extractImage(responseFallback);
            if (!imageResult) validateResponse(responseFallback);
        } else {
            throw err; // Re-throw other errors (Safety, Quota, etc.)
        }
    }

    if (imageResult) {
        return imageResult;
    }
    
    throw new Error('No image data returned from API. The AI may not have been able to process this specific request.');

  } catch (error) {
    console.error('Error processing image with Gemini API:', error);

    let finalErrorMessage = 'An unexpected error occurred with the API. Please try again.';
    
    const rawErrorString = JSON.stringify(error).toLowerCase();
    const errObj = error as any;
    const errMessage = (errObj?.message || '').toLowerCase();

    if (rawErrorString.includes('quota') || rawErrorString.includes('resource_exhausted') || errMessage.includes('quota')) {
      finalErrorMessage = 'You have exceeded your API usage quota. Please check your Google AI Studio plan and billing details and try again later.';
    } else if (
      rawErrorString.includes('permission_denied') || 
      errMessage.includes('permission_denied') || 
      errMessage.includes('403') ||
      rawErrorString.includes('403')
    ) {
      finalErrorMessage = 'API Permission Denied. The API Key provided does not have access to the required models. Please check your Google Cloud project settings.';
    } else {
      if (typeof error === 'object' && error !== null) {
        const err = error as any;
        if (err.error?.message && typeof err.error.message === 'string') {
          finalErrorMessage = err.error.message;
        } else if (err.message && typeof err.message === 'string') {
          finalErrorMessage = err.message;
        }
      } else if (typeof error === 'string') {
          finalErrorMessage = error;
      }
    }
    
    throw new Error(finalErrorMessage);
  }
};
