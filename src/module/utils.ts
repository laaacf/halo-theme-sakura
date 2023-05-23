import { documentFunction, sakura } from "../main";

export class Utils {
  @documentFunction()
  public wrapTableWithBox() {
    const contentElement = document.querySelector(".entry-content");
    const tableElements = contentElement?.querySelectorAll("table");
    tableElements?.forEach((tableElement) => {
      if (tableElement.parentElement?.classList.contains("table-wrapper")) {
        return;
      }
      const tableWrapper = document.createElement("div");
      tableWrapper.classList.add("table-wrapper");
      tableElement.parentNode?.insertBefore(tableWrapper, tableElement);
      tableWrapper.appendChild(tableElement);
    });
  }

  @documentFunction()
  public wrapImageWithBox() {
    const contentElement = document.querySelector(".site-content");
    const imageElements = contentElement?.querySelectorAll("img:not(.avatar)");
    imageElements?.forEach((imageElement) => {
      if (imageElement.classList.contains("gallery-img")) {
        return;
      }
      imageElement.classList.add("gallery-img");
      const imageWrapper = document.createElement("a");
      imageWrapper.setAttribute("data-fancybox", "gallery");
      imageWrapper.setAttribute("href", imageElement.getAttribute("src") || "");
      imageWrapper.classList.add("image-wrapper");
      imageElement.parentNode?.insertBefore(imageWrapper, imageElement);
      imageWrapper.appendChild(imageElement);
    });
  }

  /**
   * 注册 highlight (代码高亮) 功能
   * 考虑到，此功能属于常用功能，因此将其注册到 Sakura 主题中，而不是采取插件的方式。
   * 另外，注入到主题中，将能够完全掌握 highlight 的初始化时机，这对于主题性能优化是有好处的。
   */
  @documentFunction()
  public registerHighlight() {
    const preElements = document.querySelectorAll("pre") as NodeListOf<HTMLElement>;
    preElements.forEach((preElement) => {
      preElement.classList.add("highlight-wrap");
      preElement.setAttribute("autocomplete", "off");
      preElement.setAttribute("autocorrect", "off");
      preElement.setAttribute("autocapitalize", "off");
      preElement.setAttribute("spellcheck", "false");
      preElement.setAttribute("contenteditable", "false");

      const codeElement = preElement.querySelector("code") as HTMLElement;
      import("highlight.js").then(async (highlight) => {
        let lang = "";
        codeElement.classList.forEach((className) => {
          if (className.startsWith("language-")) {
            lang = className.replace("language-", "");
          }
        });

        let language = highlight.default.getLanguage(lang);
        // 如果没有指定语言，则启用自动检测
        if (!language || !language.name) {
          codeElement.classList.remove(`language-${lang}`);
          const autoLanguage = highlight.default.highlightAuto(codeElement.textContent || "");
          // 自定检测失败，则使用默认的 plain text
          if (!autoLanguage.language) {
            lang = "text";
          } else {
            lang = autoLanguage.language;
          }
          // 重新为 highlightElement 设置语言
          codeElement.classList.add(`language-${lang}`);
        } else {
          lang = language.name;
        }

        codeElement.setAttribute("data-rel", lang.toUpperCase());
        codeElement.classList.add(lang.split(",")[0].toLowerCase());
        highlight.default.highlightElement(codeElement);
        const highlightLineNumber = await import("../libs/highlightjs-line-numbers")
        highlightLineNumber.registerHljsLineNumbers(highlight.default);
        highlight.default.lineNumbersBlock(codeElement);
      });
    });
  }

  /**
   * 注册 Toc (目录)
   */
  @documentFunction()
  public registerToc() {
    const tocContainerElements = document.querySelectorAll(".toc-container");
    const headerOffset = 75;
    tocContainerElements.forEach((tocContainerElement) => {
      import("tocbot").then((tocbot) => {
        const tocElement = tocContainerElement.querySelector(".toc");
        const offset = tocContainerElement.getBoundingClientRect().top + window.pageYOffset;
        const collapseDepth = sakura.getThemeConfig("post").getValue("toc_depth", Number)?.valueOf();
        if (!tocElement) {
          return;
        }
        tocbot.default.init({
          tocElement: tocElement,
          contentSelector: [".entry-content", ".links"],
          headingSelector: "h1, h2, h3, h4, h5",
          collapseDepth: collapseDepth,
          positionFixedSelector: ".toc-container",
          positionFixedClass: "toc-container-fixed",
          scrollSmooth: true,
          headingsOffset: -(offset - headerOffset),
          scrollSmoothOffset: -headerOffset,
          disableTocScrollSync: true,
        });
      });
    });
  }
}