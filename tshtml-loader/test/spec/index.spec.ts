import { executeTemplate, templateToString } from "../../src/index";
import { join } from "path";

describe("executeTemplate", () => {
    it("should execute a simple template and return exports", () => {
        const code = `
            export default "Hello World";
        `;
        const result = executeTemplate(code, join(__dirname, "test.ts"));
        expect(result.exports.default).toBe("Hello World");
        expect(result.dependencies).toBeInstanceOf(Array);
    });

    it("should execute a template with imports", () => {
        const code = `
            import { tag } from "tshtml";
            export default tag("div", "Hello World");
        `;
        const result = executeTemplate(code, join(__dirname, "test.ts"));
        expect(result.exports.default).toBeDefined();
        expect(result.dependencies.length).toBeGreaterThan(0);
    });

    it("should execute a template with a class", () => {
        const code = `
            import { tag } from "tshtml";
            export default class {
                toString() {
                    return "Custom Template";
                }
            }
        `;
        const result = executeTemplate(code, join(__dirname, "test.ts"));
        expect(result.exports.default).toBeDefined();
        expect(typeof result.exports.default).toBe("function");
    });

    it("should track dependencies from imports", () => {
        const code = `
            import { tag } from "tshtml";
            export default tag("p", "Test");
        `;
        const result = executeTemplate(code, join(__dirname, "test.ts"));
        expect(result.dependencies).toBeInstanceOf(Array);
        // Should include tshtml module
        const hasTshtmlDep = result.dependencies.some(dep => dep.includes("tshtml"));
        expect(hasTshtmlDep).toBe(true);
    });
});

describe("templateToString", () => {
    it("should convert a string to string", () => {
        const result = templateToString("Hello");
        expect(result).toBe("Hello");
    });

    it("should convert a function by calling toString on instance", () => {
        class Template {
            toString() {
                return "<div>Test</div>";
            }
        }
        const result = templateToString(Template);
        expect(result).toBe("<div>Test</div>");
    });

    it("should convert an object with toString method", () => {
        const obj = {
            toString() {
                return "<p>Content</p>";
            }
        };
        const result = templateToString(obj);
        expect(result).toBe("<p>Content</p>");
    });

    it("should handle tshtml tag elements", () => {
        const code = `
            import { tag } from "tshtml";
            export default tag("div", { class: "test" }, "Content");
        `;
        const execResult = executeTemplate(code, join(__dirname, "test.ts"));
        const htmlString = templateToString(execResult.exports.default);
        expect(htmlString).toContain("<div");
        expect(htmlString).toContain("class=\"test\"");
        expect(htmlString).toContain("Content");
        expect(htmlString).toContain("</div>");
    });
});

describe("Integration Tests", () => {
    it("should handle a complete template workflow", () => {
        const code = `
            import { tag } from "tshtml";
            
            export default tag("div",
                { class: "container" },
                tag("h1", "Title"),
                tag("p", "Paragraph text")
            );
        `;
        const result = executeTemplate(code, join(__dirname, "test.ts"));
        const htmlString = templateToString(result.exports.default);
        
        expect(htmlString).toContain("<div class=\"container\">");
        expect(htmlString).toContain("<h1>Title</h1>");
        expect(htmlString).toContain("<p>Paragraph text</p>");
        expect(htmlString).toContain("</div>");
    });

    it("should handle nested templates", () => {
        const code = `
            import { tag } from "tshtml";
            
            const nested = tag("span", "Nested");
            export default tag("div", nested);
        `;
        const result = executeTemplate(code, join(__dirname, "test.ts"));
        const htmlString = templateToString(result.exports.default);
        
        expect(htmlString).toContain("<div>");
        expect(htmlString).toContain("<span>Nested</span>");
        expect(htmlString).toContain("</div>");
    });

    it("should handle templates with dynamic content", () => {
        const code = `
            import { tag } from "tshtml";
            
            const items = ["Item 1", "Item 2", "Item 3"];
            export default tag("ul",
                ...items.map(item => tag("li", item))
            );
        `;
        const result = executeTemplate(code, join(__dirname, "test.ts"));
        const htmlString = templateToString(result.exports.default);
        
        expect(htmlString).toContain("<ul>");
        expect(htmlString).toContain("<li>Item 1</li>");
        expect(htmlString).toContain("<li>Item 2</li>");
        expect(htmlString).toContain("<li>Item 3</li>");
        expect(htmlString).toContain("</ul>");
    });

    it("should handle null/undefined in templateToString", () => {
        expect(templateToString(null as any)).toBe("");
        expect(templateToString(undefined as any)).toBe("");
    });

    it("should handle nested arrays in templateToString", () => {
        const code = `
            import { tag } from "tshtml";
            export default [
                tag("div", "Item 1"),
                [tag("div", "Item 2"), tag("div", "Item 3")]
            ];
        `;
        const result = executeTemplate(code, join(__dirname, "test.ts"));
        const htmlString = templateToString(result.exports.default);
        expect(htmlString).toContain("Item 1");
        expect(htmlString).toContain("Item 2");
        expect(htmlString).toContain("Item 3");
    });

    it("should handle template with complex attributes", () => {
        const code = `
            import { tag } from "tshtml";
            export default tag("form", {
                method: "POST",
                action: "/submit",
                enctype: "multipart/form-data"
            },
                tag("input", { type: "text", name: "username" }),
                tag("input", { type: "password", name: "password" })
            );
        `;
        const result = executeTemplate(code, join(__dirname, "test.ts"));
        const htmlString = templateToString(result.exports.default);
        expect(htmlString).toContain("method=\"POST\"");
        expect(htmlString).toContain("action=\"/submit\"");
        expect(htmlString).toContain("type=\"text\"");
    });

    it("should handle object with toString() that's not a class", () => {
        const obj = {
            toString: () => "<span>Custom</span>"
        };
        const result = templateToString(obj);
        expect(result).toBe("<span>Custom</span>");
    });
});
