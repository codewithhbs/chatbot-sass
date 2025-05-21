const axios = require("axios");
exports.SendWhatsapp = async (phone, template, Param) => {
    const LicenseNumber = process.env.LICENSE_NUMBER;
    const apiKey = process.env.WHATSAPP_API_KEY;
    const templateId = template;
    const baseUrl = `https://ai.advanzala.in/api/sendtemplate.php?LicenseNumber=${LicenseNumber}&APIKey=${apiKey}&Contact=91${phone}&Template=${templateId}`;
    console.log("Param:", Param);

    try {

        let paramString = '';
        if (Param) {

            if (Array.isArray(Param)) {
                paramString = `&Param=${Param.join(',')}`;
            } else {

                paramString = `&Param=${Param}`;
            }
        }



        const res = await axios.get(`${baseUrl}${paramString}`);


        if (res.data.ApiResponse === "Success") {
            console.log("Message sent successfully!");
        }
    } catch (error) {
        console.log("Internal server error in sending Whatsapp", error);
        // Enhanced error handling
        if (error.response) {
            console.error(`API error: ${error.response.status} - ${error.response.data}`);
        } else if (error.request) {
            console.error("No response received:", error.request);
        } else {
            console.error("Error in setting up the request:", error.message);
        }

        console.error("Internal server error", error);
    }
};