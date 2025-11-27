import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'https://ai.megallm.io/v1',
  apiKey: process.env.MEGALLM_API_KEY || 'sk-mega-82dcae99f7fb70d409af11fde3f898c2ddce2338dd31ee8a4433c1a4c7d2a565',
});

export interface MonthlyFinancialData {
  month: string;
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  categoryBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
    count: number;
  }>;
  transactionCount: number;
  topExpenses: Array<{
    category: string;
    amount: number;
  }>;
  topIncome: Array<{
    category: string;
    amount: number;
  }>;
}

export async function generateMonthlyAnalysis(data: MonthlyFinancialData): Promise<string> {
  try {
    const prompt = `You are a financial advisor AI assistant. Analyze the following monthly financial data and provide a comprehensive, insightful, and actionable analysis report.

**Month:** ${data.month}

**Financial Summary:**
- Total Income: $${data.totalIncome.toFixed(2)}
- Total Expenses: $${data.totalExpenses.toFixed(2)}
- Net Balance: $${data.netBalance.toFixed(2)}
- Total Transactions: ${data.transactionCount}

**Category Breakdown:**
${data.categoryBreakdown.map(cat => `- ${cat.category}: $${cat.amount.toFixed(2)} (${cat.percentage.toFixed(1)}%) - ${cat.count} transactions`).join('\n')}

**Top Expenses:**
${data.topExpenses.map(exp => `- ${exp.category}: $${exp.amount.toFixed(2)}`).join('\n')}

**Top Income Sources:**
${data.topIncome.map(inc => `- ${inc.category}: $${inc.amount.toFixed(2)}`).join('\n')}

Please provide a detailed analysis that includes:
1. **Overall Financial Health**: Assess the month's financial performance
2. **Spending Patterns**: Identify key spending trends and patterns
3. **Category Insights**: Highlight notable categories and their impact
4. **Savings Analysis**: Evaluate savings potential and opportunities
5. **Recommendations**: Provide actionable advice for the next month
6. **Goals Progress**: If applicable, comment on financial goals

Make the analysis professional, friendly, and easy to understand. Use emojis sparingly but effectively. Format the response in clear sections with headings.`;

    const response = await client.chat.completions.create({
      model: 'alibaba-qwen3-32b',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful financial advisor AI that provides clear, actionable insights about personal finances. Your responses are professional, friendly, and easy to understand.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    return response.choices[0]?.message?.content || 'Unable to generate analysis at this time.';
  } catch (error) {
    console.error('Error generating AI analysis:', error);
    throw new Error('Failed to generate AI analysis. Please try again later.');
  }
}

