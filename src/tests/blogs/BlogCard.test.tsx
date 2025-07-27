/// <reference types="@testing-library/jest-dom" />
import { render, screen, fireEvent } from "@testing-library/react";
import BlogCard from "../../features/blog/BlogCard";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
}));

const defaultProps = {
  id: 123,
  title: "Test Blog Title",
  author: "Brandon K",
  slug: "test-blog-title",
  imageUrl: "https://example.com/image.jpg",
  publishedDate: "2025-07-20",
  summary: "This is a summary of the blog post.",
  variant: "list" as const, // <-- this fixes it
  isSaved: false,
  isPinned: false,
  onSave: jest.fn(),
  onUnsave: jest.fn(),
  onPin: jest.fn(),
};

describe("BlogCard", () => {
  it("renders blog title, author, and summary", () => {
    render(<BlogCard {...defaultProps} />);
    expect(screen.getByText("Test Blog Title")).toBeInTheDocument();
    expect(screen.getByText("Brandon K")).toBeInTheDocument();
    expect(screen.getByText("This is a summary of the blog post.")).toBeInTheDocument();
  });

  it("calls onSave when bookmark is clicked", () => {
    render(<BlogCard {...defaultProps} />);
    const bookmarkButton = screen.getByLabelText("Save blog");
    fireEvent.click(bookmarkButton);
    expect(defaultProps.onSave).toHaveBeenCalled();
  });

  it("calls onPin when variant is 'profile' and pin is clicked", () => {
    render(<BlogCard {...defaultProps} variant="profile" />);
    const pinButton = screen.getByLabelText("Pin blog");
    fireEvent.click(pinButton);
    expect(defaultProps.onPin).toHaveBeenCalled();
  });

  it("formats the date correctly", () => {
    render(<BlogCard {...defaultProps} />);
    expect(screen.getByText(/Jul \d{1,2}, 2025/)).toBeInTheDocument();
  });
});
