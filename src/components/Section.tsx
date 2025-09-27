import React from "react";
import styled from "@emotion/styled";

// Styled components
const SectionContainer = styled.div`
  border: 2px var(--color-border) dotted;
  border-radius: 8px;
  margin: 1em;
  padding: 0.5em 2em 2em;
  text-align: left;
`;

function Section({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <SectionContainer>
      {!!title && <h3>{title}</h3>}
      {children}
    </SectionContainer>
  );
}

export default Section;
