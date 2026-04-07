import React from "react";
import ReactMarkdown from "react-markdown";
import { Typography, Box } from "@mui/material";
import rehypeRaw from "rehype-raw"; // Pour gérer le HTML dans le Markdown

interface MarkdownRendererProps {
  children: string;
  state?: "error" | "success" | "default";
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  children,
  state = "default",
}) => {
  return (
    <Box
      sx={{
        p: 3,
        bgcolor: state === "error" ? "error.light" : "background.paper",
        borderRadius: 2,
        color: state === "error" ? "error.contrastText" : "text.primary",
        "& h1, & h2, & h3": {
          mt: 2,
          mb: 1,
          color: "primary.main",
        },
        "& p": {
          mb: 2,
        },
        "& strong": {
          fontWeight: "bold",
        },
        "& em": {
          fontStyle: "italic",
        },
        "& code": {
          bgcolor: "grey.200",
          p: 0.5,
          borderRadius: 1,
          fontFamily: "monospace",
        },
        "& pre": {
          bgcolor: "grey.900",
          p: 2,
          borderRadius: 1,
          color: "white",
          overflowX: "auto",
        },
      }}
    >
      <ReactMarkdown
        rehypePlugins={[rehypeRaw]} // Pour autoriser le HTML dans le Markdown
        components={{
          h1: ({ node, ...props }) => (
            <Typography variant="h4" gutterBottom {...props} />
          ),
          h2: ({ node, ...props }) => (
            <Typography variant="h5" gutterBottom {...props} />
          ),
          h3: ({ node, ...props }) => (
            <Typography variant="h6" gutterBottom {...props} />
          ),
          p: ({ node, ...props }) => (
            <Typography variant="body1" paragraph {...props} />
          ),
          strong: ({ node, ...props }) => (
            <Typography component="span" fontWeight="bold" {...props} />
          ),
          em: ({ node, ...props }) => (
            <Typography component="span" fontStyle="italic" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <Typography component="ul" sx={{ my: 1, pl: 3 }} {...props} />
          ),
          ol: ({ node, ...props }) => (
            <Typography component="ol" sx={{ my: 1, pl: 3 }} {...props} />
          ),
          li: ({ node, ...props }) => <Typography component="li" {...props} />,
        }}
      >
        {children}
      </ReactMarkdown>
    </Box>
  );
};

export default MarkdownRenderer;
