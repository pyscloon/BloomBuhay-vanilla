import type { StorybookConfig } from '@storybook/react-webpack5';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import postcssNested from 'postcss-nested';

const config: StorybookConfig = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-webpack5-compiler-swc",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-onboarding"
  ],
  "framework": "@storybook/react-webpack5",
  webpackFinal: async (config) => {
    // Add PostCSS loader for Tailwind CSS
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    
    // Find and modify the CSS rule
    const cssRule = config.module.rules.find((rule: any) => {
      return rule.test && rule.test.toString().includes('css');
    });
    
    if (cssRule && typeof cssRule === 'object' && 'use' in cssRule) {
      cssRule.use = [
        'style-loader',
        'css-loader',
        {
          loader: 'postcss-loader',
          options: {
            postcssOptions: {
              plugins: [
                tailwindcss,
                autoprefixer,
                postcssNested,
              ],
            },
          },
        },
      ];
    }
    
    return config;
  },
};
export default config;