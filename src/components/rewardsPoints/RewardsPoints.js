import React, { useState, useEffect } from "react";
import fetch from '../../api/customerInfo';
import ReactTable from 'react-table';
import "./RewardsPoints.css";
import _ from 'lodash';
import Spinner from '../Spinner'

function calculateResults(incomingData) {

  const months = ["Jan", "Feb", "Mar"];
  const rewardPointsPerTransaction = incomingData.map(transaction=> {
    let rewardPoints = 0;
    let over100 = transaction.amount - 100;
    let over50 = transaction.amount -50;
    
    if (over100 > 0) {
      rewardPoints += (over100 * 2);
    }    
    if (over50 > 0) {
      rewardPoints += (over50 * 1);      
    }
    const month = new Date(transaction.transactionDate).getMonth();
    return {...transaction, rewardPoints, month};
  });
               
  let byCustomer = {};
  let totalRewardPointsByCustomer = {};
  
  rewardPointsPerTransaction.forEach(rewardPointsPerTransaction => {
    let {id, name, month, rewardPoints} = rewardPointsPerTransaction; 
      
    if (!byCustomer[id]) {
      byCustomer[id] = [];      
    } 
  
    if (!totalRewardPointsByCustomer[name]) {
      totalRewardPointsByCustomer[name] = 0;
      console.log(totalRewardPointsByCustomer)
    }
  
      totalRewardPointsByCustomer[name] += rewardPoints; 
       console.log(totalRewardPointsByCustomer)  
    
    if (byCustomer[id][month]) {
      byCustomer[id][month].rewardPoints += rewardPoints;
      byCustomer[id][month].monthNumber = month;
      byCustomer[id][month].numTransactions++;      
    }
    else {
      
      byCustomer[id][month] = {
        id,
        name,
        monthNumber:month,
        month: months[month],
        numTransactions: 1,        
        rewardPoints
      }
    }    
  });
  let tot = [];
  for (var custKey in byCustomer) {    
    byCustomer[custKey].forEach(cRow=> {
      tot.push(cRow);
    });    
  }
  
  let totByCustomer = [];
  for (custKey in totalRewardPointsByCustomer) {    
    totByCustomer.push({
      name: custKey,
      rewardPoints: totalRewardPointsByCustomer[custKey]
    });    
  }
  return {
    summaryByCustomer: tot,
    rewardPointsPerTransaction,
    totalRewardPointsByCustomer:totByCustomer
  };
}

function RewardsPoints() {
  const [transactionData, setTransactionData] = useState(null);
  
  const columns = [
    {
      Header:'Customer',
      accessor: 'name'      
    },    
    {
      Header:'Month',
      accessor: 'month'
    },
    {
      Header: "Number of Transactions",
      accessor: 'numTransactions'
    },
    {
      Header:'Reward Points',
      accessor: 'rewardPoints'
    }
  ];
  const totalsByColumns = [
    {
      Header:'Customer',
      accessor: 'name'      
    },    
    {
      Header:'Reward Points',
      accessor: 'rewardPoints'
    }
  ]

  function getIndividualTransactions(row) {
    let byCustMonth = _.filter(transactionData.rewardPointsPerTransaction, (tRow)=>{    
      return row.original.id === tRow.id && row.original.monthNumber === tRow.month;
    });
    return byCustMonth;
  }

  useEffect(() => { 
    fetch().then((data)=> {             
      const results = calculateResults(data);      
      setTransactionData(results);
    });
  },[]);

  if (transactionData == null) {
    return <div>{Spinner}</div>;   
  }

  return transactionData == null ?
    <div>{Spinner}</div> 
      :    
    <div>      
      
      <div className="container">
        <div className="row">
          <div className="col-10">
            <h2>Total Reward Points by Customer per Month</h2>
          </div>
        </div>
        <div className="row">
          <div className="col-8">
            <ReactTable
              data={transactionData.summaryByCustomer}
              defaultPageSize={5}
              columns={columns}
              SubComponent={row => {
                return (
                  <div>
                    
                      {getIndividualTransactions(row).map(tran=>{
                        return <div className="container">
                          <div className="row">
                            <div className="col-8">
                              <strong>Transaction Date:</strong> {tran.transactionDate} - <strong>$</strong>{tran.amount} - <strong>Reward Points: </strong>{tran.rewardPoints}
                            </div>
                          </div>
                        </div>
                      })}                                    

                  </div>
                )
              }}
              />             
            </div>
          </div>
        </div>
        
        <div className="container">    
          <div className="row">
            <div className="col-10">
              <h2>Total Reward Points By Customer</h2>
            </div>
          </div>      
          <div className="row">
            <div className="col-8">
              <ReactTable
                data={transactionData.totalRewardPointsByCustomer}
                columns={totalsByColumns}
                defaultPageSize={5}                
              />
            </div>
          </div>
        </div>      
    </div>
  ;
}

export default RewardsPoints;