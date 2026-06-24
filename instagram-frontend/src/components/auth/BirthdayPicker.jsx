import { useState } from "react";

function BirthdayPicker({

    birthMonth,
    setBirthMonth,

    birthDay,
    setBirthDay,

    birthYear,
    setBirthYear,

    days,
    years,
    getAvailableMonths

}) {

    const [openDropdown, setOpenDropdown] =
    useState(null);

    const months =
    getAvailableMonths();

    return (

        <div className="birthday-picker">

            {/* MONTH */}

            <div className="custom-select">

                <button

                    type="button"

                    className="custom-select-trigger"

                    onClick={() =>

                        setOpenDropdown(

                            openDropdown === "month"
                            ?
                            null
                            :
                            "month"
                        )
                    }
                >

                    {

                        birthMonth

                        ?

                        months[birthMonth - 1]

                        :

                        "Month"
                    }

                    <span>⌄</span>

                </button>

                {

                    openDropdown === "month" && (

                        <div className="custom-dropdown">

                            {

                                months.map(

                                    (
                                        month,
                                        index
                                    ) => (

                                        <div

                                            key={index}

                                            className="dropdown-item"

                                            onClick={() => {

                                                setBirthMonth(
                                                    index + 1
                                                );

                                                setOpenDropdown(
                                                    null
                                                );
                                            }}
                                        >

                                            {month}

                                        </div>
                                    )
                                )
                            }

                        </div>
                    )
                }

            </div>

            {/* DAY */}

            <div className="custom-select">

                <button

                    type="button"

                    className="custom-select-trigger"

                    onClick={() =>

                        setOpenDropdown(

                            openDropdown === "day"
                            ?
                            null
                            :
                            "day"
                        )
                    }
                >

                    {

                        birthDay

                        ?

                        birthDay

                        :

                        "Day"
                    }

                    <span>⌄</span>

                </button>

                {

                    openDropdown === "day" && (

                        <div className="custom-dropdown">

                            {

                                days.map(day => (

                                    <div

                                        key={day}

                                        className="dropdown-item"

                                        onClick={() => {

                                            setBirthDay(day);

                                            setOpenDropdown(
                                                null
                                            );
                                        }}
                                    >

                                        {day}

                                    </div>
                                ))
                            }

                        </div>
                    )
                }

            </div>

            {/* YEAR */}

            <div className="custom-select">

                <button

                    type="button"

                    className="custom-select-trigger"

                    onClick={() =>

                        setOpenDropdown(

                            openDropdown === "year"
                            ?
                            null
                            :
                            "year"
                        )
                    }
                >

                    {

                        birthYear

                        ?

                        birthYear

                        :

                        "Year"
                    }

                    <span>⌄</span>

                </button>

                {

                    openDropdown === "year" && (

                        <div className="custom-dropdown">

                            {

                                years.map(year => (

                                    <div

                                        key={year}

                                        className="dropdown-item"

                                        onClick={() => {

                                            setBirthYear(
                                                year
                                            );

                                            setOpenDropdown(
                                                null
                                            );
                                        }}
                                    >

                                        {year}

                                    </div>
                                ))
                            }

                        </div>
                    )
                }

            </div>

        </div>
    );
}

export default BirthdayPicker;