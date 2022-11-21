import "../src/index.scss";

// Register and initialize the msw addon
import { initialize, mswDecorator } from "msw-storybook-addon";
initialize();

// Provide the MSW addon decorator globaly
export const decorators = [mswDecorator];

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};
