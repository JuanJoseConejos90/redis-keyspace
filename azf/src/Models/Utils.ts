import { container } from "./cosmosClient";
import { CustomerSession } from "./Interfaces"
import moment from "moment-timezone"

export const createJsonData = (sessionId: string, channel: string, name: string, lastName: string, secondLastName: string) => {
    const jsonData: CustomerSession = {
        "customerSessionId": sessionId,
        "channel": channel,
        "personIdentificationType": "",
        "personIdentification": "",
        "name": name,
        "lastName": lastName,
        "secondLastName": secondLastName,
        "birthDate": "",
        "expiryDate": "",
        "gender": {
            "code": "",
            "gender": ""
        },
        "civilStatus": {
            "codeMaritalStatus": 0,
            "MaritalStatus": ""
        },
        "codeMaritalStatus": 0,
        "maritalStatus": "",
        "placeOfBirth": "",
        "bornCountry": {
            "codeBornCountry": 0,
            "bornCountry": ""
        },
        "workplace": {
            "codCountry": 0,
            "place": ""
        },
        "isIndependent": false,
        "ip": "127.0.0.1",
        "ingressCurrency": 1,
        "dateCreated": moment().tz("America/Costa_Rica").format("YYYY-MM-DD HH:mm:ss")
    }
    return jsonData;
}

export const saveCosmos = async (data: CustomerSession) => {
    const document = {
        id: data.customerSessionId,
        ...data,
        createdAt: new Date().toISOString()
    };

    try {
        const response = await container.items.create(document);
        console.log(response)
        if (response.statusCode === 201 && response.resource?.id) {
            console.log("✅ Document saved successfully");
        }
    } catch (error: any) {
        if (error.code === 409) {
            console.log("⚠️ Document already exists");
        }
    }
}