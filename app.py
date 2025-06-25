from flask import Flask

app = Flask(__name__)

projects = [
    {
        "name": "Projects",
        "items": [
            {
                "name": "Chair",
                "price": 15.99
            }
        ]
    }
]

@app.get("/project")
def get_projects():
    return{"projects": projects}

if __name__ == "__main__":
    app.run(debug=True)