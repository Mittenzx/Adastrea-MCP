# Contributing to Adastrea-MCP

Thank you for your interest in contributing to Adastrea-MCP! We're building the world's best Unreal Engine MCP server, and we'd love your help.

## Ways to Contribute

### 🐛 Report Bugs
Found a bug? Please open an issue on GitHub with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Your environment (Node version, OS, Unreal Engine version)

### 💡 Suggest Features
Have an idea? We'd love to hear it! Check our [ROADMAP.md](./ROADMAP.md) first to see if it's already planned, then open an issue with:
- Clear description of the feature
- Use cases and benefits
- Any implementation ideas you have

### 🔧 Code Contributions
Ready to code? Here's how:

1. **Fork the repository**
2. **Create a feature branch:** `git checkout -b feature/your-feature-name`
3. **Make your changes:**
   - Follow the existing code style
   - Add tests if applicable
   - Update documentation
4. **Test your changes:** `npm run build` and test with a real MCP client
5. **Commit your changes:** Use clear, descriptive commit messages
6. **Push to your fork:** `git push origin feature/your-feature-name`
7. **Open a Pull Request**

### 📚 Documentation
Help improve our docs:
- Fix typos or unclear explanations
- Add examples and tutorials
- Improve the README or roadmap
- Write guides for common tasks

### 🧪 Testing
Help us test:
- Test with different Unreal Engine projects
- Test on different platforms (Windows, Mac, Linux)
- Report compatibility issues
- Test new features before release

## Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Mittenzx/Adastrea-MCP.git
   cd Adastrea-MCP
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build the project:**
   ```bash
   npm run build
   ```

4. **Test with an MCP client:**
   - Configure Claude Desktop or another MCP client
   - Point it to your local build: `build/index.js`

5. **Make changes and rebuild:**
   ```bash
   npm run watch  # Auto-rebuild on changes
   ```

## Code Style Guidelines

- **TypeScript:** Use TypeScript for all code
- **Formatting:** Follow the existing code style
- **Naming:** Use descriptive names for variables and functions
- **Comments:** Add comments for complex logic, but prefer self-documenting code
- **MCP Conventions:** Follow MCP SDK patterns and conventions

## Unreal Engine Specific Guidelines

When working on Unreal Engine features:
- **Test with UE 5.x:** Ensure compatibility with recent UE versions
- **Follow UE naming:** Use UE naming conventions (UCLASS, USTRUCT, etc.)
- **Consider Blueprint users:** Remember many users work primarily in Blueprints
- **Document UE-specific behavior:** UE has many quirks—document them

## Pull Request Process

1. **Update documentation** if you've changed functionality
2. **Add tests** if you've added features (when test infrastructure exists)
3. **Ensure builds pass:** `npm run build` should complete without errors
4. **Describe your changes:** Write a clear PR description explaining what and why
5. **Link related issues:** Reference any related issues in your PR

## Roadmap Alignment

Our project follows the [ROADMAP.md](./ROADMAP.md). When contributing:
- Check if your contribution aligns with upcoming phases
- Consider how it fits into the overall vision
- Feel free to propose roadmap additions or changes

## Current Focus Areas (Q1 2026)

Based on Phase 1 of our roadmap, we're particularly interested in:
- Unreal project file (`.uproject`) parsing
- Plugin and module detection
- C++ code analysis and indexing
- Blueprint metadata extraction
- Asset registry integration

## Questions?

- **GitHub Issues:** For bugs and feature requests
- **Discussions:** For questions and general discussion
- **Email:** Contact the maintainers through GitHub

## Code of Conduct

Be respectful and constructive:
- Be welcoming to newcomers
- Provide constructive feedback
- Focus on the project goals
- Respect different perspectives and experiences

## Recognition

Contributors will be:
- Listed in project credits
- Mentioned in release notes
- Appreciated by the community! 🎉

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for helping make Adastrea-MCP the best Unreal Engine MCP server in the world! 🚀
