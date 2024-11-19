/*
  Daniel Santos Martinez
  UCID: ds73
  November 20, 2024
  ASSIGNMENT 5
*/

import React, {Component} from "react";
import "./Child1.css";
import * as d3 from "d3";

// all the work done in this file.

class Child1 extends Component {
    state = {
        company: "Apple", // Default Company
        selectedMonth: "November", //Default Month
    };

    componentDidMount() {
        // console.log(this.props.csv_data);
        // initial render with the initial data from the prop
        this.chartRender();
    }

    componentDidUpdate(prevProps, prevState) {
        // console.log(this.props.csv_data);
        // to ensure the data always refreshes when the data gets uploaded and/or when we change the company and month
        if ((prevProps.csv_data !== this.props.csv_data) || (prevState.company !== this.state.company) ||
            (prevState.selectedMonth !== this.state.selectedMonth)) {
            this.chartRender();
        }
    }

    radioChangeCompany = (event) => {
        // changes to the state based on the company chosen in the radio button
        this.setState({company: event.target.value});
    };

    dropdownChangeMonth = (event) => {
        // changes to the state based on the month chosen in the dropdown menu
        this.setState({selectedMonth: event.target.value});
    };

    chartRender() {
        // d3 function to do all the work with processing the data and rending the line chart

        // mapping the data correctly for d3 to be able to process it correctly.
        const data = this.props.csv_data.map((data_map) => ({
            ...data_map,
            Date: new Date(data_map.Date),
            Open: +data_map.Open,
            Close: +data_map.Close,
        }));

        // filtering the data to ensure that we obtain the specific data based on the month and company the
        // user chooses. this ensures that the data matches that, and we use the correct data to visualize.
        const correctDataFilter = data.filter((d) => {
            const monthName = d.Date.toLocaleString("default", {month: "long"});
            return (
                d.Company === this.state.company &&
                monthName === this.state.selectedMonth
            );
        });

        const width = 800;
        const height = 400;
        const margin = {top: 40, right: 30, bottom: 30, left: 40};

        // Remove any existing SVG to clear previous chart
        d3.select(".line-chart-visualization svg").remove();

        // creating the svg element to place the plit in
        const svg_element = d3.select(".line-chart-visualization")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // defining the X & Y Scale
        const xScale = d3.scaleTime()
            .domain(
                d3.extent(correctDataFilter, function (d) {
                    return d.Date;
                })
            )
            .range([margin.left * 4, width - 200]);

        const yScale = d3.scaleLinear()
            .domain([
                d3.min(correctDataFilter, function (d) {
                    return Math.min(d.Open, d.Close);
                }),
                d3.max(correctDataFilter, function (d) {
                    return Math.max(d.Open, d.Close);
                }),
            ])
            .range([height - 150, 0]);

        // defining the Open and Close d3 Line objects
        const OpenDataLine = d3.line()
            .x(function (d) {
                return xScale(d.Date);
            })
            .y(function (d) {
                return yScale(d.Open);
            })
            .curve(d3.curveCardinal);

        const CloseDataLine = d3.line()
            .x(function (d) {
                return xScale(d.Date);
            })
            .y(function (d) {
                return yScale(d.Close);
            })
            .curve(d3.curveCardinal);

        // appending the Open and Close Line objects to the svg d3 object
        svg_element.selectAll(".open-line-visualization")
            .data([correctDataFilter])
            .join(
                enter => enter.append("path")
                    .attr("class", "open-line-visualization")
                    .attr("fill", 'none')
                    .attr("stroke", "#b2df8a")
                    .attr("stroke-width", 2)
                    .attr("d", OpenDataLine),
                update => update.attr("d", OpenDataLine),
                exit => exit.remove()
            );

        svg_element.selectAll(".close-line-visualization")
            .data([correctDataFilter])
            .join(
                enter => enter.append("path")
                    .attr("class", "close-line-visualization")
                    .attr("fill", 'none')
                    .attr("stroke", "#e41a1c")
                    .attr("stroke-width", 2)
                    .attr("d", CloseDataLine),
                update => update.attr("d", CloseDataLine),
                exit => exit.remove()
            );

        // defining the tooltip object for the info box visualization
        const tooltip = d3.select(".line-chart-visualization")
            .append("div")
            .attr("class", "stock-data-tooltip");

        // this object displays the tooltip info box when we go over a data point and matches the requirements
        const tooltipDisplayAppear = (event, d) => {
            tooltip.transition().duration(200).style("opacity", 0.7);
            tooltip
                .html(
                    `
          <span>Date:</span> ${d.Date.toLocaleDateString("en-US")}<br/>
          <span>Open:</span> ${d.Open.toFixed(2)}<br/>
          <span>Close:</span> ${d.Close.toFixed(2)}<br/>
          <span>Difference:</span> ${(d.Close - d.Open).toFixed(2)}
        `
                )
                .style("left", `${event.pageX}px`)
                .style("top", `${event.pageY}px`);
        };

        // the d3 obj used to hide the tooltip info box when we move away from the data point
        const tooltipDisplayHide = () =>
            tooltip.transition().duration(500).style("opacity", 0);

        // circle elements for the Close data points
        svg_element.selectAll(".dot-open")
            .data(correctDataFilter)
            .join(
                enter => enter.append("circle")
                    .attr("class", "dot-open")
                    .attr("cx", (d) => xScale(d.Date))
                    .attr("cy", (d) => yScale(d.Open))
                    .attr("r", 4)
                    .attr("fill", "#b2df8a")
                    .on("mouseover", tooltipDisplayAppear)
                    .on("mouseout", tooltipDisplayHide),
                update => update.attr("cx", (d) => xScale(d.Date))
                    .attr("cy", (d) => yScale(d.Open)),
                exit => exit.remove()
            );

        // circle elements for the Close data points
        svg_element.selectAll(".dot-close")
            .data(correctDataFilter)
            .join(
                enter => enter.append("circle")
                    .attr("class", "dot-close")
                    .attr("cx", (d) => xScale(d.Date))
                    .attr("cy", (d) => yScale(d.Close))
                    .attr("r", 4)
                    .attr("fill", "#e41a1c")
                    .on("mouseover", tooltipDisplayAppear)
                    .on("mouseout", tooltipDisplayHide),
                update => update.attr("cx", (d) => xScale(d.Date))
                    .attr("cy", (d) => yScale(d.Close)),
                exit => exit.remove()
            );

        // Appending the X & Y Axes to the chart
        svg_element.append("g")
            .attr("transform", `translate(0, ${height - 140})`)
            .call(d3.axisBottom(xScale))
            .selectAll("text")
            .attr("class", "x-axis-label")
            .attr("transform", "rotate(45)"); // rotating the text just like the visualization asks for

        svg_element.append("g")
            .attr("class", "y-axis-label")
            .attr("transform", `translate(155,0)`)
            .call(d3.axisLeft(yScale));

        // Appending the Legend Color boxes and text to the line chart visualization
        // Open legend
        svg_element.append("rect")
            .attr("class", "open-legend-box")
            .attr("x", width - 175)
            .attr("y", -20)
            .attr("width", 25)
            .attr("height", 25);

        svg_element.append("text")
            .attr("class", "open-legend-text")
            .attr("x", width - 145)
            .attr("y", -6)
            .text("Open")
            .attr("alignment-baseline", "middle");

        // Close legend
        svg_element.append("rect")
            .attr("class", "close-legend-box")
            .attr("x", width - 175)
            .attr("y", 10)
            .attr("width", 25)
            .attr("height", 25);

        svg_element.append("text")
            .attr("class", "close-legend-text")
            .attr("x", width - 145)
            .attr("y", 22)
            .text("Close")
            .attr("alignment-baseline", "middle");
    }

    render() {
        const options = ["Apple", "Microsoft", "Amazon", "Google", "Meta"]; // Use this data to create radio button
        const months = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
        ]; // Use this data to create dropdown

        return (
            <div className="child1">
                {/* radio buttons */}
                <div className="radio-buttons">
                    <span>Company: </span>
                    {options.map((Companies) => (
                        <label key={Companies}>
                            <input
                                type="radio"
                                value={Companies}
                                checked={this.state.company === Companies}
                                onChange={this.radioChangeCompany}
                            />
                            {Companies}
                        </label>
                    ))}
                </div>
                {/* month dropdown */}
                <div className="month-dropdown">
                    <span>Month: </span>
                    <select
                        value={this.state.selectedMonth}
                        onChange={this.dropdownChangeMonth}
                    >
                        {months.map((selectedMonths) => (
                            <option>{selectedMonths}</option>
                        ))}
                    </select>
                </div>
                {/* line chart div */}
                <div className="line-chart-visualization"></div>
            </div>
        );
    }
}

export default Child1;
