jest.mock("react-hot-loader/root", () => ({
    hot: jest.fn(widget => widget)
}))
