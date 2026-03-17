/**
 * @author Aayush Kamtikar
 */

define([
  'baja!',
  'baja!control:NumericWritable,control:BooleanWritable,control:NumericOverride,control:BooleanOverride',
  'bajaux/Widget',
  'bajaux/commands/Command',
  'bajaux/commands/CommandGroup',
  'css!nmodule/folderDashboard/rc/css/FolderDashboardView',
  'hbs!nmodule/folderDashboard/rc/template/FolderDashboardViewTemplate',
  'jquery',
  'nmodule/webEditors/rc/fe/baja/NumericEditor',
  'nmodule/webEditors/rc/fe/baja/OverrideEditor',
  'nmodule/webEditors/rc/fe/feDialogs',
  'nmodule/webEditors/rc/wb/menu/CommandGroupContextMenu',
], function (
  baja,
  types,
  Widget,
  Command,
  CommandGroup,
  FolderDashboardViewTemplateCss,
  FolderDashboardViewTemplate,
  $,
  NumericEditor,
  OverrideEditor,
  feDialogs,
  CommandGroupContextMenu,
) {

  'use strict';
  const NUMERIC_WRITABLE_TYPE = "control:NumericWritable";
  const BOOLEAN_WRITABLE_TYPE = "control:BooleanWritable";

  const DEFAULT_TEXT_SIZE = "14px";
  const SMALL_TEXT_SIZE = "16px";
  const MEDIUM_TEXT_SIZE = "18px";
  const LARGE_TEXT_SIZE = "20px";

  const COLOURS = {
    red : "#C30909", //False
    green: "#259129", //True & Numeric Writable
    purple: "#7D3C98", //Boolean Writable
    orange: "#D78D2B", //Override
    black : "rgba(249, 249, 249, 0.1)", //Background colour
  };

  return class FolderDashboardView extends Widget {

    /**
     * Initializes the dashboard view and sets up core state.
     *
     * @param {Object} dom
     */
    doInitialize(dom) {
      // Render the initial dashboard template into the DOM
      dom.html(FolderDashboardViewTemplate);

      // Create a new subscriber to handle point/folder events
      this.$subscriber = new baja.Subscriber();

      // Reset the current folder value reference
      this.$value = null;
    }

    /**
     * Loads a folder of points into the dashboard, subscribes to them, and renders cards.
     *
     * @param {Object} value - A Baja folder object containing slots/points to load.
     */
    async doLoad(value) {
      const that = this;
      if (!value) return;

      try {
        // Lease and load slots to ensure we can access properties
        await value.lease();
        await value.loadSlots();
        that.$value = value;

        // Collect all properties in the folder
        const folderProperties = value.getSlots().properties().toValueArray();

        // Filter only NumericWritable and BooleanWritable points for the dashboard
        const dashboardPoints = folderProperties.filter((prop) =>
            prop.getType().is(NUMERIC_WRITABLE_TYPE) ||
            prop.getType().is(BOOLEAN_WRITABLE_TYPE)
        );

        // Subscribe and create cards for each dashboard point
        for (const point of dashboardPoints) {
          await that.attachSubAndCreateCard(point);
        }

        // Subscribe to the folder itself to detect additions/removals
        await that.$subscriber.subscribe(value);

        // Handle property added events
        that.$subscriber.attach("added", async function (prop, cx) {
          if (
            prop.getType().is(NUMERIC_WRITABLE_TYPE) ||
            prop.getType().is(BOOLEAN_WRITABLE_TYPE)
          ) {
            await that.attachSubAndCreateCard(prop.$val);
          }
        });

        // Handle property removed events
        that.$subscriber.attach("removed", async function (prop, cx) {
          if (
            prop.getType().is(NUMERIC_WRITABLE_TYPE) ||
            prop.getType().is(BOOLEAN_WRITABLE_TYPE)
          ) {
            // Unsubscribe from the removed point
            await that.$subscriber.unsubscribe(prop.$val);

            // Remove the corresponding card from the UI
            that.jq().find(`#${prop.$slotName}-card`).remove();
          }
        });
      } catch (err) {
        // Log any errors encountered during loading
        console.error("Error loading value:", err);
      }
    }

    /**
     * Subscribes to a point, creates its card, and attaches update logic.
     *
     * @param {Object} point - A Baja control point object to subscribe to and render.
     */
    async attachSubAndCreateCard(point) {
      const that = this;

      // Subscribe to the point so we can listen for changes
      await that.$subscriber.subscribe(point);

      // Create and render the card for this point
      that.createCard(point);

      // Attach listener for property changes
      that.$subscriber.attach("changed", function (prop, cx) {
        // Only update if the "out" property of this specific point changes
        if (prop.getName() === "out" && prop.$complex.getName() === point.getName()) {
          that.updateCard(point);
        }
      });
    }

    /**
     * Creates a new card for a given point and renders it in the UI.
     *
     * @param {Object} point - A Baja control point object with metadata and output values.
     */
    createCard(point) {
      // Extract all display properties for the card
      const pointData = this.validateOutputValue(point);

      // Render the card using the structured data
      this.renderCard(pointData);
    }

    /**
     * Extracts and formats display properties for a given control point.
     *
     *
     * @param {Object} point - A Baja control point object
     *
     * @returns {Object} An object containing all display properties for the card
     */
    validateOutputValue(point) {
      // Point details
      const pointName = point.getName();
      const pointDisplayName = point.getDisplayName();
      const pointType = point.getType();

      // Current value and status
      const pointValue = point.getOut().getValue();
      const pointStatusValue = point.getOut().getStatusDisplay();

      // Handle override expiration: convert to string if present, else null
      let overrideExpirationValue = point.getOverrideExpiration();
      if (!overrideExpirationValue.isNull()) {
        overrideExpirationValue = overrideExpirationValue.getTime().toString();
      } else {
        overrideExpirationValue = null;
      }

      // Default styling
      let titleBorderColour = COLOURS.black;
      let valueBackgroundColour;
      let statusTextColour;
      let textSize = DEFAULT_TEXT_SIZE;

      // Numeric points: purple border, font size scales with value
      if (pointType.is(NUMERIC_WRITABLE_TYPE)) {
        titleBorderColour = COLOURS.purple;
        if (pointValue < 50) {
          textSize = SMALL_TEXT_SIZE;
        } else if (pointValue < 100) {
          textSize = MEDIUM_TEXT_SIZE;
        } else {
          textSize = LARGE_TEXT_SIZE;
        }

        // Boolean points: green border, background color based on true/false
      } else if (pointType.is(BOOLEAN_WRITABLE_TYPE)) {
        titleBorderColour = COLOURS.green;
        valueBackgroundColour = pointValue ? COLOURS.green : COLOURS.red;
      }

      // Status background: highlight overridden points
      statusTextColour = /overridden/.test(pointStatusValue) ? COLOURS.orange : null;

      // Return all computed properties
      return {
        pointName,
        pointDisplayName,
        pointValue,
        pointStatusValue,
        titleBorderColour,
        valueBackgroundColour,
        statusTextColour,
        textSize,
        overrideExpirationValue
      };
    }

    /**
     * Renders a card element in the UI for a given point.
     *
     * Styling (border color, background colors, font size) is applied based on
     * the point type and status. The card is appended to the grid container
     * and a context menu handler is attached for right-click actions.
     *
     * @param {Object} pointData - Object containing all display properties for the card
     */
    renderCard(pointData) {
      const {
        pointName,
        pointDisplayName,
        pointValue,
        pointStatusValue,
        titleBorderColour,
        valueBackgroundColour,
        statusTextColour,
        textSize,
        overrideExpirationValue
      } = pointData;

      // Build the card HTML using template literals
      const cardHtml = `
    <div id="${pointName}-card" class="card" >
      <div class="card-title" style="border-color:${titleBorderColour};">${pointDisplayName}</div>
      <div class="card-body">
        <!-- Value section -->
        <div class="card-content">
          <div class="card-key">Value</div>
          <div class="card-value" style="font-size: ${textSize}; background-color: ${valueBackgroundColour};">${pointValue}</div>
        </div>
        <!-- Override status section -->
        <div class="card-content">
          <div class="card-key">Override Status</div>
          <div class="card-value" style="color: ${statusTextColour}">${pointStatusValue}</div>
        </div>
        <!-- Override expiration section (hidden if null) -->
        <div class="card-content" style="display: ${overrideExpirationValue ? "flex" : "none"}">
          <div class="card-key">Override Expiration</div>
          <div class="card-value" style="color: ${statusTextColour}">${overrideExpirationValue || ""}</div>
        </div>
      </div>
    </div>
  `;

      // Append the card to the grid container
      this.jq().find('.grid-container').append(cardHtml);

      // Attach right-click context menu handler
      this.jq().find(`#${pointName}-card`).on("contextmenu", (event) => this.createMenu(this, event));
    }

    /**
     * Updates the UI card for a given point with the latest values and styling.
     *
     * @param {Object} point - A Baja control point object
     */
    updateCard(point) {
      const {
        pointValue,
        pointStatusValue,
        valueBackgroundColour,
        statusTextColour,
        textSize,
        overrideExpirationValue
      } = this.validateOutputValue(point);

      // Find all .card-value elements inside the card for this point
      const cardValues = this.jq().find(`#${point.getName()}-card .card-value`);

      // First element: "Value"
      cardValues[0].innerText = pointValue;
      cardValues[0].style.fontSize = `${textSize}`;
      cardValues[0].style.backgroundColor = valueBackgroundColour;

      // Second element: "Override Status"
      cardValues[1].innerText = pointStatusValue;
      cardValues[1].style.color = statusTextColour;

      // Third element: "Override Expiration" (optional)
      if (cardValues[2]) {
        cardValues[2].innerText = overrideExpirationValue || "";
        cardValues[2].style.color = statusTextColour;

        // Show or hide the expiration section depending on whether a value exists
        const expirationContainer = cardValues[2].closest(".card-content");
        if (expirationContainer) {
          expirationContainer.style.display = overrideExpirationValue ? "flex" : "none";
        }
      }
    }

    /**
     * Creates and displays a custom context menu for a point card.
     * The menu is positioned next to the card element that was right‑clicked.
     *
     * @param {Object} that - Reference to the current class instance (used to access $value).
     * @param {Event} event - The right‑click event triggered on a card element.
     * @returns {Object} The displayed CommandGroupContextMenu instance.
     */
    createMenu(that, event) {
      event.preventDefault(); // Prevents the browser’s default context menu

      // Extract the point ID from the card element’s DOM id (format: "<pointName>-card")
      const id = event.currentTarget.id.split("-")[0];
      if (!id) return;

      // Retrieve the point object from the class’s $value map
      const point = that.$value.get(id);

      // Define available commands based on point type
      const commands = [
        new Command({
          displayName: "Override",
          func: () => overrideAction(point),
          enabled: point.getType().is(NUMERIC_WRITABLE_TYPE)
        }),
        new Command({
          displayName: "Active / Inactive",
          func: () => activeInactiveAction(point),
          enabled: point.getType().is(BOOLEAN_WRITABLE_TYPE)
        }),
        new Command({
          displayName: "Auto",
          func: () => autoAction(point)
        }),
      ];

      // Group commands together
      const group = new CommandGroup({ commands });

      // Position the menu relative to the clicked card
      const domRect = event.currentTarget.getBoundingClientRect();
      const x = domRect.right;
      const y = domRect.top;

      // Show the context menu at the calculated position
      return CommandGroupContextMenu.show({ group, x, y });
    }

  };

  /**
   * Opens an override dialog for a numeric writable point and applies the override if confirmed.
   *
   * @param {Object} point - A Baja control point of type "control:NumericWritable".
   */
  async function overrideAction(point) {
    if (point.getType().is(NUMERIC_WRITABLE_TYPE)) {
      // Create a NumericOverride value object
      const value = baja.$("control:NumericOverride");

      // Show override dialog with an editor
      await feDialogs.showFor({
        title: "Override",
        value: value,
        type: OverrideEditor
      }).then(async (result) => {
        // If user cancels, do nothing
        if (!result) return;

        // Apply override to the point
        await point.invoke({ slot: "override", value: value });
      });
    }
  }

  /**
   * Opens an Active/Inactive dialog for a boolean writable point and applies the chosen state.
   *
   * @param {Object} point - A Baja control point of type "control:BooleanWritable".
   */
  async function activeInactiveAction(point) {
    if (point.getType().is(BOOLEAN_WRITABLE_TYPE)) {
      // Create a BooleanOverride value object
      const value = baja.$("control:BooleanOverride");

      // Show dialog with editor
      await feDialogs.showFor({
        title: "Active / Inactive",
        value: value,
        type: OverrideEditor
      }).then(async (result) => {
        if (!result) return;

        // Invoke either "active" or "inactive" slot depending on boolean value
        await point.invoke({
          slot: value.getValue() ? "active" : "inactive",
          value: value
        });
      });
    }
  }

  /**
   * Sets a point back to automatic mode.
   *
   * @param {Object} point - A Baja control point (any type that supports "auto").
   */
  async function autoAction(point) {
    // Simply invoke the "auto" slot to clear overrides
    await point.invoke("auto");
  }

});