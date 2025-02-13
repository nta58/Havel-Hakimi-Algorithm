#include <iostream>
using namespace std;

vector<int> get_sequence()
{
  size_t size;
  cout << "Enter the number of verticies: ";
  cin >> size;

  vector<int> degree_sequence;
  int input;
  size_t i = 0;
  cout << "\nEnter your degree sequence (MAXIMUM DEGREE IS " << size - 1 << "): ";
  while(i < size)
  {
    cin >> input;
    degree_sequence.push_back(input);
    i++;
  }
  return degree_sequence;
}

void print_each_state(const vector<int>& degree_sequence)
{
  for(const int& d : degree_sequence)
  {
    cout << d << " ";
  }
  cout << endl;
}

bool havel_hakimi(vector<int>& degrees)
{
  while(!degrees.empty())
  {
    //sort in descending order
    sort(degrees.rbegin(), degrees.rend());

    //if the first degree is 0 then we are done
    if(degrees.at(0) == 0)
    {
      return true;
    }

    //get the highest degree in the list then delete it
    int highest_degree = degrees[0];

    //check if we have enough verticies
    if(highest_degree > degrees.size())
    {
      return false;
    }
    degrees.erase(degrees.begin()); //delete the first element bc the list is sorted in descending order

    //decrement the degrees by 1
    for(int i = 0; i < highest_degree; i++)
    {
      degrees.at(i)--;
      //stop when encounter negative number
      if(degrees.at(i) < 0)
      {
        cout << "Negative number encountered" << endl;
        return false;
      }
    }
    print_each_state(degrees);
  }
  return true;
}

int main() {
  vector<int> degree_sequence = get_sequence();
  print_each_state(degree_sequence);
  if(havel_hakimi(degree_sequence))
  {
    cout << "Succefully construct graph using the Havel-Hakimi Algorithm" << endl;
  }else{
    cout << "Cannot construct such a graph" << endl;
  }
  return 0;
}