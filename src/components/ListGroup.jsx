import { Fragment, useState } from "react"

// { items: [], heading: string}
const props = {
    items: ["item1", "item2"],
    heading: "My Heading"
  };

function ListGroup()
{
    let items = ['New York', 'San Francisco', 'Tokyo', 'London','Paris' ];
    //let selectedItem = 0;
    const [selectedIndex, setSelectedIndex] = useState(0); //Hook
    //items = [];

    items.map(item=> <li>{item}</li>);
    
    
    return<Fragment>
        <h1>List </h1>
        {items.length == 0 && <p>No item found</p>}
        <ul class="list-group"> 
            {items.map((item, index)=> (
                <li class={selectedIndex == index ? 'list-group-item active' : 'list-group-item'} key ={item}
                onClick={()=> setSelectedIndex(index) }
                >
                    {item}
                    </li>
            )
            )}
</ul>
</Fragment>
}

export default ListGroup