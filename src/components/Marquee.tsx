import React from "react";
import styled from "@emotion/styled";
import { keyframes } from "@emotion/react";

// Keyframes for scrolling animation
const scrollLeft = keyframes`
  0% {
    transform: translateX(100%);
  }
  100% {
    transform: translateX(-100%);
  }
`;

// Styled components
const MarqueeContainer = styled.div`
  overflow: hidden;
`;

const ScrollingText = styled.div`
  white-space: nowrap;
  overflow: hidden;
  animation: ${scrollLeft} 20s linear infinite;
  padding: 8px 0;
  font-family: "Pirata One", "UnifrakturCook", system-ui, "celticBit";
  font-weight: bold;
  font-size: 18px;
  color: var(--color-text-warning);
`;

function Marquee({ children }: { children: React.ReactNode }) {
  return (
    <MarqueeContainer>
      <ScrollingText>{children}</ScrollingText>
    </MarqueeContainer>
  );
}

export default Marquee;
