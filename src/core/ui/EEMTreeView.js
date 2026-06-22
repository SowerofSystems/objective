/**
 * EEMTreeView.js - Treeview Navigation UI for EEMs
 *
 * Builds a recursive HTML treeview (<ul>/<li>) from EEMTreeManager.
 * Handles:
 * - Click to set active EEM and trigger DOMBridge.stampAll()
 * - Context menu for creating/removing child EEMs
 * - Visual highlighting of active node
 *
 * Zero build step: vanilla DOM manipulation only.
 */
(function () {
  "use strict";

  window.TEUI = window.TEUI || {};

  // ============================================================================
  // TREEVIEW COMPONENT
  // ============================================================================

  /**
   * Create an EEM Treeview UI component
   * @param {Object} options
   * @param {HTMLElement} options.container - DOM container for the treeview
   * @param {Object} options.treeManager - EEMTreeManager instance
   * @returns {EEMTreeView}
   */
  function createEEMTreeView(options = {}) {
    const container = options.container;
    const treeManager = options.treeManager;

    if (!container || !treeManager) {
      console.warn("[EEMTreeView] container and treeManager are required");
      return null;
    }

    let contextMenu = null;

    // ========================================================================
    // RENDER
    // ========================================================================

    /**
     * Render the full treeview into the container
     */
    function render() {
      container.innerHTML = "";

      const root = treeManager.getRoot();
      if (!root) {
        container.textContent = "No EEM tree initialized.";
        return;
      }

      const ul = renderNode(root);
      ul.classList.add("eem-treeview");
      container.appendChild(ul);
    }

    /**
     * Recursively render a tree node as nested <ul>/<li>
     * @param {EEMNode} node
     * @returns {HTMLUListElement}
     */
    function renderNode(node) {
      const ul = document.createElement("ul");
      const li = document.createElement("li");

      const label = document.createElement("span");
      label.className = "eem-tree-label";
      label.textContent = node.name;
      label.dataset.eemId = node.id;

      // Highlight active node
      const active = treeManager.getActiveEEM();
      if (active && active.id === node.id) {
        label.classList.add("eem-active");
      }

      // Show baseline indicator if different from parent
      if (
        node.baselineId &&
        node.parent &&
        node.baselineId !== node.parent.id
      ) {
        const badge = document.createElement("span");
        badge.className = "eem-baseline-badge";
        const baselineNode = treeManager.getNode(node.baselineId);
        badge.textContent = ` [baseline: ${baselineNode ? baselineNode.name : node.baselineId}]`;
        label.appendChild(badge);
      }

      // Click handler: set active EEM and update DOM
      label.addEventListener("click", function (e) {
        e.stopPropagation();
        treeManager.setActiveEEM(node.id);
        render(); // Re-render tree to update active highlight

        // Trigger DOMBridge to update all inputs/outputs for the active EEM
        if (window.TEUI.DOMBridge?.stampAll) {
          window.TEUI.DOMBridge.stampAll();
        }
      });

      // Context menu handler
      label.addEventListener("contextmenu", function (e) {
        e.preventDefault();
        e.stopPropagation();
        showContextMenu(e.pageX, e.pageY, node);
      });

      li.appendChild(label);

      // Render children recursively
      if (node.children.length > 0) {
        const childUl = document.createElement("ul");
        childUl.className = "eem-tree-children";
        for (const child of node.children) {
          const childLi = renderNode(child).querySelector("li");
          if (childLi) {
            childUl.appendChild(childLi);
          }
        }
        li.appendChild(childUl);
      }

      ul.appendChild(li);
      return ul;
    }

    // ========================================================================
    // CONTEXT MENU
    // ========================================================================

    /**
     * Show a context menu for an EEM node
     * @param {number} x - Page X position
     * @param {number} y - Page Y position
     * @param {EEMNode} node - The node that was right-clicked
     */
    function showContextMenu(x, y, node) {
      hideContextMenu();

      contextMenu = document.createElement("div");
      contextMenu.className = "eem-context-menu";
      contextMenu.style.position = "absolute";
      contextMenu.style.left = x + "px";
      contextMenu.style.top = y + "px";
      contextMenu.style.zIndex = "10000";

      const items = [
        { label: "Create Child EEM", action: () => promptCreateChild(node) },
        {
          label: "Set as Active",
          action: () => {
            treeManager.setActiveEEM(node.id);
            render();
            if (window.TEUI.DOMBridge?.stampAll) {
              window.TEUI.DOMBridge.stampAll();
            }
          },
        },
        {
          label: "Change Baseline...",
          action: () => promptChangeBaseline(node),
        },
      ];

      // Only allow removal of non-root nodes
      if (node.parent) {
        items.push({
          label: "Remove EEM",
          action: () => {
            treeManager.removeNode(node.id);
            render();
            if (window.TEUI.DOMBridge?.stampAll) {
              window.TEUI.DOMBridge.stampAll();
            }
          },
        });
      }

      for (const item of items) {
        const menuItem = document.createElement("div");
        menuItem.className = "eem-context-menu-item";
        menuItem.textContent = item.label;
        menuItem.addEventListener("click", function (e) {
          e.stopPropagation();
          hideContextMenu();
          item.action();
        });
        contextMenu.appendChild(menuItem);
      }

      document.body.appendChild(contextMenu);

      // Close context menu on click elsewhere
      function closeOnClick(e) {
        if (!contextMenu?.contains(e.target)) {
          hideContextMenu();
          document.removeEventListener("click", closeOnClick);
        }
      }
      setTimeout(() => document.addEventListener("click", closeOnClick), 0);
    }

    /**
     * Hide the context menu
     */
    function hideContextMenu() {
      if (contextMenu && contextMenu.parentNode) {
        contextMenu.parentNode.removeChild(contextMenu);
      }
      contextMenu = null;
    }

    // ========================================================================
    // PROMPTS (simple fallback - production would use modals)
    // ========================================================================

    /**
     * Prompt user to create a child EEM
     * @param {EEMNode} parentNode
     */
    function promptCreateChild(parentNode) {
      const name = prompt("Enter name for new EEM:", "New EEM");
      if (!name) return;

      treeManager.createChild(parentNode.id, name);
      render();
    }

    /**
     * Prompt user to change baseline for an EEM
     * @param {EEMNode} node
     */
    function promptChangeBaseline(node) {
      const allNodes = treeManager.getAllNodes();
      const options = allNodes
        .filter(n => n.id !== node.id)
        .map(n => `${n.id}: ${n.name}`)
        .join("\n");

      const input = prompt(
        `Select baseline EEM ID for "${node.name}":\n\n${options}`,
        node.baselineId || ""
      );
      if (!input) return;

      const baselineId = input.split(":")[0].trim();
      treeManager.setBaseline(node.id, baselineId);
      render();
    }

    // ========================================================================
    // LIFECYCLE
    // ========================================================================

    /**
     * Initialize: render tree and listen for changes
     */
    function init() {
      render();

      // Re-render when tree changes
      treeManager.addListener(function () {
        render();
      });
    }

    /**
     * Destroy: clean up event listeners and DOM
     */
    function destroy() {
      hideContextMenu();
      container.innerHTML = "";
    }

    // ========================================================================
    // EXPORT API
    // ========================================================================

    return {
      init,
      render,
      destroy,
      showContextMenu,
      hideContextMenu,
    };
  }

  // ============================================================================
  // EXPORT
  // ============================================================================

  window.TEUI.EEMTreeView = {
    create: createEEMTreeView,
  };

  console.log("[EEMTreeView] Module loaded");
})();
