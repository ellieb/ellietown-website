import React from "react";
import styled from "@emotion/styled";

// Styled components

const SectionContainer = styled.div<{
  noBorder: boolean;
}>`
  border: ${({ noBorder }) =>
    noBorder ? "none" : "2px var(--color-border) dotted"};
  border-radius: 8px;
  margin: 1em;
  padding: 0.5em 1em 1em;
  text-align: left;
  overflow-x: auto;
  overflow-y: visible;

  /* Compact list styling */
  ul {
    margin: 0.5em 0;
    padding-left: 1.5em;
  }

  li {
    margin: 0.25em 0;
    line-height: 1.4;
  }

  /* Tablets */
  @media (min-width: 768px) {
    padding: 0.5em 2em 2em;
  }

  /* Desktop */
  @media (min-width: 1024px) {
    padding: 0.5em 2em 2em;
  }
`;

function Section({
  title,
  children,
  noBorder = false,
}: {
  title?: string;
  children: React.ReactNode;
  noBorder?: boolean;
}) {
  return (
    <SectionContainer noBorder={noBorder}>
      {!!title && <h3>{title}</h3>}
      {children}
    </SectionContainer>
  );
}

export default Section;
