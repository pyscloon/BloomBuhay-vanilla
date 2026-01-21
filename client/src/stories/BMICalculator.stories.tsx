import type { Meta, StoryObj } from "@storybook/react";
import BMICalculator from "../components/tools/pregnant/BMICalculator";

/* ---------------- MOCK SERVICES ---------------- */
const fakeService = {
  getAll: async () => ({
    success: true,
    data: {
      metrics: [
        {
          id: 1,
          title: "BMI",
          value: "22.4",
          unit: "kg/cm",
          notes: JSON.stringify({ weight: 60, height: 165, weightUnit: "kg", heightUnit: "cm" }),
          createdAt: new Date().toISOString(),
        },
      ],
    },
  }),
  createMetric: async (payload: any) => ({
    success: true,
    data: { id: Math.random(), ...payload, createdAt: new Date().toISOString() },
  }),
  deleteMetric: async () => ({ success: true }),
} as any;

const fakeServiceError = {
  getAll: async () => ({ success: false }),
  createMetric: async () => ({ success: false }),
  deleteMetric: async () => ({ success: false }),
} as any;

/* ---------------- STORY META ---------------- */
const meta: Meta<typeof BMICalculator> = {
  title: "BloomBuhay/Tools/BMI Calculator",
  component: BMICalculator,
};

export default meta;
type Story = StoryObj<typeof BMICalculator>;

/* ---------------- STORIES ---------------- */

// Empty state
export const Default: Story = {
  render: () => <BMICalculator service={{ ...fakeService, getAll: async () => ({ success: true, data: { metrics: [] } }) }} />,
};

// With saved metrics
export const WithSavedMetrics: Story = {
  render: () => <BMICalculator service={fakeService} />,
};

// Error state
export const ErrorState: Story = {
  render: () => <BMICalculator service={fakeServiceError} />,
};
