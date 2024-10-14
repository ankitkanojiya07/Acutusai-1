import requests

url = "https://api.acutusai.com/api/v1/survey/create"
headers = {
    "Authorization": "G906sbKlN",
    "Content-Type": "application/json"
}

data = {
    "Survey": {
        "id": 1,
        "projectName": "Market Research Project",
        "SurveyStatusCode": "LIVE",
        "CountryLanguageID": 101,
        "IndustryID": 2,
        "StudyTypeID": 3,
        "ClientCPI": 5.0,
        "ClientSurveyLiveURL": "https://example.com/live-survey",
        "TestRedirectURL": "https://example.com/test-redirect",
        "IsActive": True,
        "Quota": 100,
        "SurveyName": "Consumer Behavior Survey",
        "Completes": 50,
        "FID": "FID12345",
        "status": "active",
        "IR": 20,
        "LOI": 15,
        "country": "US",
        "endedAt": "2024-12-31T23:59:59Z"
    },
    "Quotas": [
        {
            "SurveyQuotaID": 1,
            "Name": "Age Group 18-24",
            "SurveyQuotaType": "Demographic",
            "FieldTarget": 50,
            "Quota": 100,
            "Prescreens": 30,
            "Completes": 20,
            "IsActive": True
        }
    ],
    "Conditions": [
        {
            "ConditionID": 1,
            "SurveyQuotaID": 1,
            "QuestionID": 101,
            "PreCodes": [1, 2, 3]
        }
    ],
    "Qualifications": [
        {
            "QualificationID": 1,
            "SurveyID": 1,
            "QuestionID": 202,
            "PreCodes": [4, 5]
        }
    ]
}

response = requests.post(url, headers=headers, json=data)

print(f"Status Code: {response.status_code}")
print(f"Response: {response.json()}")
