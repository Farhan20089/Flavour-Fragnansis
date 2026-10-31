import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { prisma } from '@/src/lib/prisma';
import { z } from 'zod';

const chatMessageSchema = z.object({
  message: z.string().trim().min(1).max(2000),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'model', 'assistant']),
        text: z.string().max(2000),
      })
    )
    .optional()
    .default([]),
});

function getRuleBasedFallback(userMsg: string): string {
  const lower = userMsg.toLowerCase();

  if (lower.includes('shipping') || lower.includes('delivery') || lower.includes('cost')) {
    return 'We offer complimentary express courier delivery on all orders over $150. For standard orders under $150, shipping is a flat rate of $15. Orders are hand-prepared in our Swiss atelier and dispatched within 2–4 business days with end-to-end temperature monitoring.';
  }

  if (lower.includes('return') || lower.includes('refund') || lower.includes('exchange')) {
    return 'We provide a 30-day satisfaction guarantee for all unopened flacons and canisters in their original tamper-evident seals. If you would like to initiate an exchange or return, please visit our Contact page or message us directly with your order number.';
  }

  if (lower.includes('winter') || lower.includes('oud') || lower.includes('wood') || lower.includes('warm')) {
    return 'For cold seasons and evening elegance, we highly recommend our **Oud Ispahan & Bulgarian Rose** (SKU: FRG-PRM-202) featuring smoky agarwood and Damascus rose, or our **Sandalwood & Florentine Iris** (SKU: FRG-FIN-201) with creamy New Caledonian santal and violet undertones. Both offer 14-hour longevity.';
  }

  if (lower.includes('fresh') || lower.includes('summer') || lower.includes('citrus') || lower.includes('bergamot')) {
    return 'For bright, uplifting profiles, explore our **Calabrian Bergamot & Haitian Vetiver** (SKU: FRG-FIN-203) or our folded **Sicilian Blood Orange Distillate** (SKU: FLV-BEV-105). They provide sparkling aldehydic zest with unmatched natural clarity.';
  }

  if (lower.includes('flavour') || lower.includes('taste') || lower.includes('drink') || lower.includes('beverage')) {
    return 'Our Flavour Division specializes in heat-stable and acid-stable botanical extracts: our **Alphonso Mango WONF** is an award-winner for artisanal beverages, while our **Madagascar Bourbon Vanilla** is optimized for high-temperature confectionery and bakery applications. Visit the [Flavours](/flavours) collection to browse.';
  }

  if (lower.includes('fragrance') || lower.includes('perfume') || lower.includes('scent')) {
    return 'Our Haute Parfumerie library offers masterfully balanced compositions compliant with IFRA 51st Amendment standards. You can explore the complete palette in our [Fragrances](/fragrances) section, with sizes ranging from 50ml atomizers to laboratory flacons.';
  }

  if (lower.includes('order') || lower.includes('track') || lower.includes('status')) {
    return 'You can check your active order anytime by visiting [Order History](/orders) in your account, or by entering your order number (e.g. FF-XXXX-XXXX) on our tracking portal.';
  }

  if (lower.includes('human') || lower.includes('agent') || lower.includes('representative') || lower.includes('custom') || lower.includes('bulk')) {
    return 'For bespoke GC-MS counter-matching or industrial drum volumes, our formulation directors are ready to assist. Please submit an inquiry through our [Contact Us](/contact) page or email us at concierge@flavourandfragrances.com, and a senior perfumer will respond within 24 hours.';
  }

  return 'Welcome to Flavour & Fragrances. I am your concierge. Whether you are looking for an exquisite personal perfume, a bespoke botanical flavour system, or have questions regarding your order and shipping, I am delighted to assist you. Would you like a fragrance recommendation or help navigating our collections?';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = chatMessageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Please enter a message' }, { status: 400 });
    }

    const { message, history } = parsed.data;

    // Check if GEMINI_API_KEY is configured
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      const fallbackReply = getRuleBasedFallback(message);
      return NextResponse.json({
        success: true,
        reply: fallbackReply,
        source: 'concierge-fallback',
      });
    }

    try {
      const ai = new GoogleGenAI({ apiKey });

      // Fetch featured products for dynamic context
      const featured = await prisma.product.findMany({
        where: { featured: true, status: 'Active' },
        select: { name: true, sku: true, category: true, parentGroup: true, price: true, shortDescription: true },
        take: 8,
      });

      const catalogContext = featured
        .map((p) => `- ${p.name} (${p.parentGroup}, $${p.price}): ${p.shortDescription}`)
        .join('\n');

      const systemPrompt = `You are the Virtual Concierge for "Flavour & Fragrances", an ultra-luxury Swiss perfume and botanical taste formulation house based in Geneva.
Brand Identity:
- Aesthetic: Minimalist luxury, discreet elegance, artisanal mastery (akin to Byredo, Le Labo, Creed).
- Categories: Fine Fragrances (Haute Parfumerie) & Artisanal Flavours (Taste Systems for Beverages, Bakery, Confectionery).
- Brand Name: Flavour & Fragrances (never mention unauthorized names like MUJI or SK Group).

Website Navigation Links:
- Home: /
- Shop All: /shop
- Flavours Showcase: /flavours
- Fragrances Showcase: /fragrances
- Shopping Cart: /cart
- Checkout: /checkout
- Customer Account & Orders: /orders
- Contact & Bespoke Lab Briefs: /contact

Shipping & Policies:
- Free express courier delivery on orders over $150. Standard shipping is $15.
- Orders ship in 2-4 business days in climate-controlled packaging.
- 30-day return policy for unopened items in pristine condition.
- If an inquiry involves complex industrial pilot testing (>500kg) or custom chemical synthesis, warmly direct the customer to /contact.

Selected Signature Creations:
${catalogContext}

Instructions:
1. Speak with understated, courteous luxury, poise, and deep sensory knowledge.
2. Recommend specific products when asked.
3. Keep responses concise, clear, and well-structured using markdown.
4. When relevant, embed markdown links to /shop, /flavours, /fragrances, /cart, or /contact.`;

      const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: 'Understood. I am the Flavour & Fragrances Virtual Concierge, ready to guide your clientele with elegance, product knowledge, and discreet luxury.' }] },
      ];

      for (const turn of history.slice(-6)) {
        contents.push({
          role: turn.role === 'user' ? 'user' : 'model',
          parts: [{ text: turn.text }],
        });
      }

      contents.push({
        role: 'user',
        parts: [{ text: message }],
      });

      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
      });

      const reply = result.text || getRuleBasedFallback(message);

      return NextResponse.json({
        success: true,
        reply,
        source: 'gemini',
      });
    } catch (aiError) {
      console.warn('Gemini API call failed, using graceful fallback:', aiError);
      return NextResponse.json({
        success: true,
        reply: getRuleBasedFallback(message),
        source: 'concierge-fallback',
      });
    }
  } catch (error) {
    console.error('Chat endpoint error:', error);
    return NextResponse.json({ error: 'Chat service temporarily unavailable' }, { status: 500 });
  }
}

