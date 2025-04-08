import "@rainbow-me/rainbowkit/styles.css";
import { ScaffoldEthAppWithProviders } from "~~/components/ScaffoldEthAppWithProviders";
import { ThemeProvider } from "~~/components/ThemeProvider";
import "~~/styles/globals.css";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata = getMetadata({ title: "IdeaPulse App", description: "Built with 🏗 IdeaPulse" });

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  return (
    <html suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{
          __html: `
            :root {
              --color-primary-rgb: 139, 92, 246;
              --color-secondary-rgb: 59, 130, 246;
              --color-accent-rgb: 14, 165, 233;
            }
            [data-theme="dark"] {
              --color-primary-rgb: 168, 126, 255;
              --color-secondary-rgb: 96, 165, 250;
              --color-accent-rgb: 56, 189, 248;
            }
            /* Smooth theme transition */
            * {
              transition-property: color, background-color, border-color;
              transition-duration: 0.2s;
              transition-timing-function: ease-out;
            }
            /* Selectively exclude wallet connection components to prevent theme switch lag */
            [data-rk], [class*='rainbowkit'] {
              transition: none !important;
            }
            /* Dify聊天机器人自定义样式 */
            #dify-chatbot-bubble-button {
              background-color: #8B5CF6 !important;
              border-radius: 50% !important;
            }
            #dify-chatbot-bubble-window {
              width: 95vw !important;
              height: 95vh !important;
              border-radius: 1rem !important;
              bottom: 70px !important;
            }
            @media (max-width: 640px) {
              #dify-chatbot-bubble-window {
                width: 100vw !important;
                height: 85vh !important;
              }
            }
          `
        }} />
        {/* Dify聊天机器人脚本 */}
        <script dangerouslySetInnerHTML={{
          __html: `
            window.difyChatbotConfig = { 
              token: 'gBN2A7uHX3miRs1O',
              baseUrl: 'https://udify.app',
              containerProps: {
                style: {
                  boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.3)',
                  borderRadius: '50%'
                }
              }
            }
          `
        }}></script>
        <script src="https://udify.app/embed.min.js" id="gBN2A7uHX3miRs1O" defer></script>
      </head>
      <body>
        <ThemeProvider enableSystem>
          <ScaffoldEthAppWithProviders>{children}</ScaffoldEthAppWithProviders>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default ScaffoldEthApp;