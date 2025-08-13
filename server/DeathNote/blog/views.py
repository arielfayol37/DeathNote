from django.shortcuts import render
from django.http import HttpResponse, FileResponse, JsonResponse
import os
import json

# Create your views here

def index(request):
    return render(request, 'blog/info.html', {})

def download_pdf(request, paper_title):
    """Download a PDF file"""
    pdf_path = os.path.join('static', 'pdfs', paper_title + ".pdf")
    return FileResponse(open(pdf_path, 'rb'), as_attachment=True, content_type='application/pdf')

def get_employees(request):
    employees = [
    {'first_name': 'Alice', 'last_name': 'Smith', 'ID': 4056568},
    {'first_name': 'Bob', 'last_name': 'Johnson', 'ID': 4056569},
    # {'first_name': 'Carol', 'last_name': 'Williams', 'ID': 4056570},
    {'first_name': 'David', 'last_name': 'Brown', 'ID': 4056571},
    {'first_name': 'Emma', 'last_name': 'Jones', 'ID': 4056572},
    {'first_name': 'Frank', 'last_name': 'Davis', 'ID': 4056573},
    {'first_name': 'Grace', 'last_name': 'Miller', 'ID': 4056574},
    {'first_name': 'Henry', 'last_name': 'Wilson', 'ID': 4056575},
    {'first_name': 'Isabella', 'last_name': 'Moore', 'ID': 4056576},
    {'first_name': 'James', 'last_name': 'Taylor', 'ID': 4056577},
    {'first_name': 'Katherine', 'last_name': 'Anderson', 'ID': 4056578},
    {'first_name': 'Liam', 'last_name': 'Thomas', 'ID': 4056579},
    {'first_name': 'Mia', 'last_name': 'Jackson', 'ID': 4056580},
    {'first_name': 'Noah', 'last_name': 'White', 'ID': 4056581},
    {'first_name': 'Olivia', 'last_name': 'Harris', 'ID': 4056582},
    {'first_name': 'Peter', 'last_name': 'Martin', 'ID': 4056583},
    {'first_name': 'Quinn', 'last_name': 'Thompson', 'ID': 4056584},
    {'first_name': 'Rose', 'last_name': 'Garcia', 'ID': 4056585},
    {'first_name': 'Samuel', 'last_name': 'Martinez', 'ID': 4056586},
    {'first_name': 'Tara', 'last_name': 'Robinson', 'ID': 4056587}
]
    # Convert the list of dictionaries to JSON format
    employees_json = json.dumps(employees)
    # Return the JSON response
    return JsonResponse(employees_json, safe=False)

def get_lawnmowers(request):
    lawnmowers = [{'brand': 'Honda', 'model': 'HRX217K5VKA', 'name':'Striker', 'ID':7489},
    {'brand': 'John Deere', 'model': 'X350R', 'name':'Mower', 'ID':7490},
    {'brand': 'Cub Cadet', 'model': 'XT1 LT42', 'name':'Mowzilla', 'ID':7491},
    {'brand': 'Husqvarna', 'model': 'LC221RH', 'name':'Grasshopper', 'ID':7492},
    {'brand': 'Toro', 'model': 'TimeCutter SS4225', 'name':'Tornado', 'ID':7493},
    {'brand': 'Snapper', 'model': 'SPX 21', 'name':'BladeRunner', 'ID':7494},
    {'brand': 'Craftsman', 'model': 'CMXGMAM201103', 'name':'GrassMaster', 'ID':7495},
    {'brand': 'Ryobi', 'model': 'RY48110', 'name':'GreenMachine', 'ID':7496},
    {'brand': 'Black+Decker', 'model': 'CM2043C', 'name':'EcoMow', 'ID':7497},
    {'brand': 'Greenworks', 'model': '25022', 'name':'EcoWarrior', 'ID':7498},
    {'brand': 'EGO', 'model': 'LM2142SP', 'name':'PowerMow', 'ID':7499},
    {'brand': 'Stihl', 'model': 'RMA 460', 'name':'GrassMaster Pro', 'ID':7500},
    {'brand': 'Toro', 'model': 'Recycler 22', 'name':'GrassCrusher', 'ID':7501},
    {'brand': 'Honda', 'model': 'HRR216K9VKA', 'name':'LawnBeast', 'ID':7502},
    {'brand': 'John Deere', 'model': 'X570', 'name':'LawnKing', 'ID':7503},
    {'brand': 'Cub Cadet', 'model': 'XT2 GX54', 'name':'Mowzilla Pro', 'ID':7504},
    {'brand': 'Husqvarna', 'model': 'LC221A', 'name':'GrassMaster Elite', 'ID':7505},
    {'brand': 'Snapper', 'model': 'SPX 21', 'name':'BladeRunner Pro', 'ID':7506},
    {'brand': 'Craftsman', 'model': 'CMXGMAM201103', 'name':'GrassMaster Elite', 'ID':7507},
                  ]
    # Convert the list of dictionaries to JSON format
    lawnmowers_json = json.dumps(lawnmowers)
    # Return the JSON response
    return JsonResponse(lawnmowers_json, safe=False)

def lawnmower_data(request):
    # gets the post request data and print
    data = request.POST.get('datapoints')
    print(data)
    # return response with status ok
    return JsonResponse({'status': 'ok'}, status=200)

def employee_stat(request, employee_id):
    # Simulate fetching employee data from a database or other source
    employee_data = {
        'id': employee_id,
        'first_name': 'Liam',
        'last_name': 'Thomas',
        'distance': 5280,
        'time': 2645,
        'avg_speed': 35.2,
        'max_speed': 44,
    }
    # Return the employee data as JSON response
    return JsonResponse(employee_data)