sap.ui.define(["sap/ui/core/Control"], (Control) => {
    return Control.extend("com.myorg.myapp.control.CustomPage", {
        metadata: {
            properties: {
                title: { type: "string", defaultValue: "" },
                style: { type: "string", defaultValue: "" },
                logoSrc: { type: "string", defaultValue: "" },
            },
            aggregations: {
                navItems: { type: "sap.ui.core.Control", multiple: true, singularName: "navItem" },
                actions: { type: "sap.ui.core.Control", multiple: true, singularName: "action" }, 
                content: { type: "sap.ui.core.Control", multiple: true, singularName: "content" },
            },
        },

        renderer: {
            render(oRM, oControl) {
                oRM.openStart("div", oControl)
                    .class("customPage")
                    .attr("style", oControl.getStyle() || "")
                    .openEnd();

                oRM.openStart("div").class("customPageHeader").openEnd();

                if (oControl.getLogoSrc()) {
                    oRM.openStart("img")
                        .class("customPageLogo")
                        .attr("src", oControl.getLogoSrc())
                        .attr("alt", "Company Logo")
                        .openEnd()
                        .close("img");
                }

                oRM.openStart("nav").class("customPageNav").openEnd();
                const aNavItems = oControl.getNavItems();
                aNavItems.forEach((item) => oRM.renderControl(item));
                oRM.close("nav");

                oRM.openStart("div").class("customPageActions").openEnd();
                const aActions = oControl.getActions();
                aActions.forEach((action) => oRM.renderControl(action));
                oRM.close("div");

                oRM.close("div"); 

               oRM.openStart("div",oControl).class("customContent").openEnd()
               const contents = oControl.getContent()
               contents.forEach(contents=>oRM.renderControl(contents))
               oRM.close("div")

                oRM.close("div");
            },
        },
    });
});