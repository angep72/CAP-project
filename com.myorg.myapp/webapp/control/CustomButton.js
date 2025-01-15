sap.ui.define(["sap/ui/core/Control"],(Control)=>{
    return Control.extend("saprecap.control.CustomButton",{
        metadata:{
            properties:{
                text:{type:"string", defaultValue:""},
                style:{type:"string", defaultValue:""},
                class:{type:"string",defaultValue:""},
                visible:{type:"boolean",defaultValue:true},
                submitting: { type: "boolean", defaultValue: false },
                submitColor: { type: "string", defaultValue: "" }
            },
            events:{"customPress":{parameters:{
                "customData":{type:"string"}
            }},
            "submissionStart": {},
            "submissionEnd": {}  
        }
        },
        renderer:{
            render(oRM,oControl){
                oRM.openStart("button",oControl).class("customButton").class(oControl.getClass()).attr("style",oControl.getStyle()).openEnd()
                if(oControl.getVisible()){
                    oRM.text(oControl.getText())
                }
                oRM.close("button")
            },
           
        },
        onclick(){
            if (this.getSubmitting()) {
                return;
            }

            this.setSubmitting(true);
            this.setText("Submitting");
            this.fireEvent("submissionStart");

            setTimeout(() => {
                this.setSubmitting(false);
                this.setText("Submit");
                this.fireEvent("submissionEnd");
            }, 2000); 
        }
    })
})